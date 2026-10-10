import { ServerResponse, IncomingMessage } from "node:http";
import ResponseBuilder from "../../services/responseBulider.service.js";
import Database from "../../database/connection.js";
import DebugClass from "../../decorators/logger.decorator.js";
import type { ApiResponse } from "../../types/response.type.js";
import Input from "../../services/Input.service.js";
import type { User } from "../../types/user.type.js";
import bcrypt from "bcrypt";
import JWT from "../../services/jwt.service.js";
import EnvConfig from "../../config/env.js";
import { collections } from "../../helpers/constants.js";

@DebugClass
class Auth {
  private readonly builder: ResponseBuilder;
  private readonly jwt: JWT;
  private readonly env: EnvConfig;

  constructor(private readonly db: Database) {
    this.builder = new ResponseBuilder();
    this.jwt = new JWT();
    this.env = new EnvConfig();
  }

  public async createUser(req: IncomingMessage, res: ServerResponse) {
    let data: ApiResponse;
    try {
      const input = new Input(req);
      const body = await input.post();
      const postVal = body ? JSON.parse(body) : {};

      const name = postVal.name ?? "";
      const type = postVal.type ?? "";
      const email = postVal.email ?? "";
      const password = postVal.password ?? "";

      if (typeof name !== "string" || name.trim().length === 0) {
        return this.builder.sendJson(res, 422, {
          status: false,
          message: "Name is requied!",
          data: null,
        });
      }

      if (typeof name !== "string" || name.trim().length === 0) {
        return this.builder.sendJson(res, 422, {
          status: false,
          message: "Type is requied!",
          data: null,
        });
      }

      const userTypes: User["type"][] = ["user", "admin", "subAdmin"];

      if (
        typeof type !== "string" ||
        !userTypes.includes(type as User["type"])
      ) {
        return this.builder.sendJson(res, 422, {
          status: false,
          message: "Invalid user type!",
          data: null,
        });
      }

      if (typeof name !== "string" || name.trim().length === 0) {
        return this.builder.sendJson(res, 422, {
          status: false,
          message: "Email is requied!",
          data: null,
        });
      }

      if (typeof name !== "string" || name.trim().length === 0) {
        return this.builder.sendJson(res, 422, {
          status: false,
          message: "Password is requied!",
          data: null,
        });
      }

      if (password.length < 6) {
        return this.builder.sendJson(res, 422, {
          status: false,
          message: "Password is characters 6 or more!",
          data: null,
        });
      }

      const checkExist = await this.db
        .getDatabase()
        .collection("users")
        .find({ email })
        .toArray();

      if (checkExist.length > 0) {
        return this.builder.sendJson(res, 422, {
          status: false,
          message: `Email ${email} aleardy exist!`,
          data: null,
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertResult = await this.db
        .getDatabase()
        .collection(collections.USERS)
        .insertOne({
          name,
          email,
          password: hashedPassword,
          type,
          isLoggedIn: false,
          lastLoginTime: null,
          lastLogoutTime: null,
        });

      data = {
        status: true,
        message: "User created successfully.",
        data: { id: insertResult.insertedId },
      };

      return this.builder.sendJson(res, 201, data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong!";

      data = {
        status: false,
        message: message,
        data: null,
      };
      this.builder.sendJson(res, 500, data);
    }
  }

  public async login(req: IncomingMessage, res: ServerResponse) {
    let data: ApiResponse;
    try {
      const input = new Input(req);
      const body = await input.post();
      const postVal = body ? JSON.parse(body) : {};

      const email = postVal.email ?? "";
      const password = postVal.password ?? "";


      this.db.transactions(async (session) => {
        const user = await this.db.setCollection("users").findOne({ email });

        if (!user) {
          return this.builder.sendJson(res, 422, {
            status: false,
            message: "Invalid credentials",
            data: null,
          });
        }

        const passwordValid = await bcrypt.compare(password, user.password);

        if (!passwordValid) {
          return this.builder.sendJson(res, 401, {
            status: false,
            message: "Invalid credentials",
            data: null,
          });
        }

        await this.db.setCollection(collections.USERS).updateOne(
          { _id: user._id },
          {
            $set: {
              isLoggedIn: true,
              lastLoginTime: new Date(),
              lastLogoutTime: null,
            },
          },
          { session },
        );

        await this.db.setCollection(collections.USERS_HISTORY).insertOne(
          {
            userId: user._id,
            email: user.email,
            action: 'LOGOUT',
            timestamp: new Date()
          },
          {session}
        )


        const token = this.jwt.generate({
          userId: user?._id.toString(),
          name: user?.name,
          type: user?.type,
        });

        return this.builder.sendJson(res, 200, {
            status: true,
            message: "Login successful",
            data: {
                email,
                token: token!,
            },
        });
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong!";

      data = {
        status: false,
        message: message,
        data: null,
      };
      this.builder.sendJson(res, 500, data);
    }
  }

  public async logout(req: IncomingMessage, res: ServerResponse) {
    let data: ApiResponse;
    try {
      const input = new Input(req);
      const body = await input.post();

      const postVal = body ? JSON.parse(body) : {};

      const email = postVal.email ?? "";
      const token = postVal.token ?? "";


      if (!token) {
        return this.builder.sendJson(res, 422, {
          status: false, 
          message: 'Token is required!', 
          data: null
        })
      }

      const result = this.db.transactions(async (session) => {

        const user = await this.db.setCollection(collections.USERS)
          .findOne({email}, {session});

        if (!user) {
          return {
            status: false,
            code: 404,
            message: 'User not found!'
          };
        } 
        
        if (user.isLoggedIn === false) {
          return {
            status: false,
            code: 422,
            message: 'User already logged out'
          }
        }

        const verifiedToken = await this.jwt.verify(token);

        if (!verifiedToken) {
          return {
            status: false,
            code: 401,
            message: 'Invalid or expired token!'
          };
        }

        await this.db.setCollection(collections.USERS).updateOne(
          {_id: user._id},
          {
            $set: {
              isLoggedIn: false,
              lastLogoutTime: new Date()
            }
          },
          {session}
        )

        await this.db.setCollection(collections.USERS_HISTORY).insertOne(
          {
            userId: user._id,
            email: user.email,
            action: 'LOGIN',
            timestamp: new Date()
          },
          {session}
        )

        return {status: true, code: 200, message: 'Logout successfull'};

      })

      data = {
        status: (await result).status,
        message: (await result).message,
        data: null
      }

      return  this.builder.sendJson(res, (await result).code, data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong!";

      data = {
        status: false,
        message: message,
        data: null,
      };
      this.builder.sendJson(res, 500, data);
    }
  }

}

export default Auth;
