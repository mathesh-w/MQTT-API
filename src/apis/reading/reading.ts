import type { IncomingMessage, ServerResponse } from "http";
import Database from "../../database/connection.js";
import Input from "../../services/Input.js";
import ResponseBuilder from "../../services/responseBulider.service.js";
import type { ApiResponse } from "../../types/response.type.js";
import DebugClass from "../../decorators/logger.decorator.js";

@DebugClass
class ReadingApi {
  private readonly builder: ResponseBuilder;

  constructor(private readonly db: Database) {
    this.builder = new ResponseBuilder();
  }

  public async getReadings(req: IncomingMessage, res: ServerResponse) {
    let data: ApiResponse;
    try {
      const input = new Input(req);
      const getVal = input.get().searchParams;

      const body = await input.post();
      const postVal = body ? JSON.parse(body) : {};

      const limit = postVal.limit ?? getVal.get("limit");
      const sensorType = postVal.sensorType ?? getVal.get("sensorType");
      const sensorId = postVal.sensorId ?? getVal.get("sensorId");
      const page = postVal.page ?? getVal.get("page");
      const date = postVal.date ?? getVal.get("date");

      const filter: Record<string, any> = {};
      if (sensorId) filter.sensorId = sensorId;
      if (sensorType) filter.sensorType = sensorType;
      if (date) {
        const startDate = new Date(`${date}T00:00:00`);
        const endDate = new Date(`${date}T00:00:00`);
        endDate.setDate(endDate.getDate() + 1);

        filter.timestamp = {
          $gte: startDate,
          $lt: endDate,
        };
      }

      const limitNum = limit ? parseInt(limit, 10) : 100;
      const pageNum = page ? parseInt(page, 10) : 1;
      const skip = (pageNum - 1) * limitNum;

      const collection = this.db.setCollection("readings");
      const total = await collection.countDocuments(filter);
      const readingsList = await collection
        .find(filter)
        .skip(skip)
        .limit(limitNum)
        .toArray();

      data = {
        status: true,
        message: "reading-list",
        data: {
          count: total,
          totalPage: Math.ceil(total / limitNum),
          list: readingsList,
        },
      };

      this.builder.sendJson(res, 200, data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went worng!";
      data = {
        status: false,
        message: message,
        data: null,
      };
      this.builder.sendJson(res, 500, data);
    }
  }

  public async getStats(req: IncomingMessage, res: ServerResponse) {
    let data: ApiResponse;
    const alloadedDate = ["today", "thisMonth", "lastMonth"];
    try {
      const input = new Input(req);
      const getVal = input.get().searchParams;

      const body = await input.post();
      const postVal = body ? JSON.parse(body) : {};

      const requestDate = postVal.date ?? getVal.get("date") ?? "today";
      const date: string = alloadedDate.includes(requestDate)
        ? requestDate
        : "today";

      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);

      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      );
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      let startDate: Date;
      let endDate: Date;

      switch (date) {
        case "today":
          startDate = startOfToday;
          endDate = startOfTomorrow;
          break;

        case "thisMonth":
          startDate = startOfThisMonth;
          endDate = endOfThisMonth;
          break;

        case "lastMonth":
          startDate = startOfLastMonth;
          endDate = endOfLastMonth;
          break;

        default:
          startDate = startOfLastMonth;
          endDate = endOfLastMonth;
          break;
      }

      const [stats] = await this.db
        .setCollection("readings")
        .aggregate([
          {
            $match: {
              timestamp: {
                $gte: startDate,
                $lte: endDate,
              },
            },
          },
          {
            $facet: {
              // 1. unique sensor types
              sensorType: [
                {
                  $group: {
                    _id: "$sensorType",
                  },
                },
                {
                  $project: {
                    _id: 0,
                    sensorType: "$_id",
                  },
                },
              ],

              // 2. count readings by sensor type
              counts: [
                {
                  $group: {
                    _id: "$sensorType",
                    count: { $sum: 1 },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    sensorType: "$_id",
                    count: 1,
                  },
                },
              ],

              // 3. min and max value by sensor type
              minMax: [
                {
                  $group: {
                    _id: "$sensorType",
                    min: { $min: "$value" },
                    max: { $max: "$value" },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    sensorType: "$_id",
                    min: 1,
                    max: 1,
                  },
                },
              ],

              // 4. average value by sensor type
              averages: [
                {
                  $group: {
                    _id: "$sensorType",
                    average: {
                      $avg: "$value",
                    },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    sensorType: "$_id",
                    average: { $round: ["$average", 2] },
                  },
                },
              ],
            },
          },
        ])
        .toArray();

      data = {
        status: true,
        message: "Stats of the sensor.",
        data: { stats, alloadedDate },
      };
      this.builder.sendJson(res, 200, data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went woring!";
      data = {
        status: false,
        message: message,
        data: null,
      };

      this.builder.sendJson(res, 500, data);
    }
  }

  public async deleteReading(req: IncomingMessage, res: ServerResponse) {
    let data: ApiResponse;
    try {
      const input = new Input(req);
      const body = await input.post();
      const postVal = body ? JSON.parse(body) : {};
      const deleteId = postVal.deleteId ?? null;
      const date = postVal.date ?? null;

      if (!deleteId && !date) {
        return this.builder.sendJson(res, 422, {
          status: false,
          message: "Delete ID & date is required!",
          data: null,
        });
      }

      const start = new Date(`${date}T00:00:00.000+05:30`);
      const end = new Date(`${date}T23:59:59.999+05:30`);

      const deleteResult = await this.db.setCollection("readings").deleteMany({
        sensorId: deleteId,
        timestamp: {
          $gte: start,
          $lte: end,
        },
      });

      this.builder.sendJson(res, 200, {
        status: true,
        message: "Readings deleted successfully!",
        data: {
          sensorId: deleteId,
          date: date,
          deletedCount: deleteResult.deletedCount,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went woring!";
      data = {
        status: false,
        message: message,
        data: null,
      };

      this.builder.sendJson(res, 500, data);
    }
  }

  public async createReading(req: IncomingMessage, res: ServerResponse) {
    let data: ApiResponse;
    try {
      const input = new Input(req);
      const body = await input.post();
      const postVal = body ? JSON.parse(body) : {};
      const sensorId = postVal.sensorId ?? null;
      const sensorType = postVal.sensorType ?? null;
      const value = postVal.value ?? null;
      const date = new Date();

      if (!sensorId) {
        return this.builder.sendJson(res, 422, {
          status: false,
          message: "Sensor ID is required!",
          data: null,
        });
      }

      if (!sensorType) {
        return this.builder.sendJson(res, 422, {
          status: false,
          message: "Sensor ID is required!",
          data: null,
        });
      }

      if (value === null || typeof value !== "number") {
        return this.builder.sendJson(res, 422, {
          status: false,
          message: "Value is required!",
          data: null,
        });
      }

      const createdResult = await this.db
        .setCollection("readings")
        .insertOne({ sensorId, sensorType, value, timestamp: new Date() });

      return this.builder.sendJson(res, 201, {
        status: true,
        message: "Reading created successfully!",
        data: {
          sensorId,
          value,
          timestamp: new Date(),
          insertedId: createdResult.insertedId,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went woring!";
      data = {
        status: false,
        message: message,
        data: null,
      };
    }

    this.builder.sendJson(res, 500, data);
  }

  public async updateReading(req: IncomingMessage, res: ServerResponse) {
    let data: ApiResponse;
    try {
      const input = new Input(req);
      const body = await input.post();
      const postVal = body ? JSON.parse(body) : {};
      const sensorId = postVal.sensorId ?? null;
      const value = postVal.value ?? null;
      const date = postVal.date ?? null;

      if (!sensorId) {
        return this.builder.sendJson(res, 422, {
          status: false,
          message: "Sensor ID is required!",
          data: null,
        });
      }

      if (!value) {
        return this.builder.sendJson(res, 422, {
          status: false,
          message: "Value is required!",
          data: null,
        });
      }

      const start = new Date(`${date}T00:00:00.000+05:30`);
      const end = new Date(`${date}T23:59:59.999+05:30`);

      const updateResult = await this.db
        .setCollection("readings")
        .updateMany(
          { timestamp: { $gte: start, $lt: end }, sensorId },
          {$set: { value }},
        );


      return this.builder.sendJson(res, 201, {
        status: true,
        message: "Reading created successfully!",
        data: {
          sensorId,
          value,
          modifiedCount: updateResult.modifiedCount,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went woring!";
      data = {
        status: false,
        message: message,
        data: null,
      };
    }

    this.builder.sendJson(res, 500, data);
  }

  public async getLatestReading(req: IncomingMessage, res: ServerResponse) {
    let data: ApiResponse;
    try {
      const input = new Input(req);
      const getVal = input.get().searchParams;

      const body = await input.post();
      const postVal = body ? JSON.parse(body) : {};

      const limit = postVal.limit ?? getVal.get("limit") ?? 10;
      const sensorType = postVal.sensorType ?? getVal.get("sensorType");
      const sensorId = postVal.sensorId ?? getVal.get("sensorId");

      if (!sensorId) {
        return this.builder.sendJson(res, 422, {
          status: false,
          message: "Sensor ID is required!",
          data: null,
        });
      }

      const match: any = {};
      
      if (sensorId) {
        match.sensorId = sensorId;
      } else if (sensorType) {
        match.sensorType = sensorType;
      } 


      const latestReadings = await this.db.setCollection("readings").aggregate([
        {
          $match: match,
        },
        {
          $sort: {
            timestamp: -1
          }
        },
        {
          $limit: limit,
        },
      ]).toArray();

      // console.log('test: ', updateResult)

      return this.builder.sendJson(res, 201, {
        status: true,
        message: "Reading created successfully!",
        data: {
          latestReadings,
        },
      });

    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went woring!";
      data = {
        status: false,
        message: message,
        data: null,
      };
    }

    this.builder.sendJson(res, 500, data);
  }
}

export default ReadingApi;
