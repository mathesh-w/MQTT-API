import { ServerResponse, IncomingMessage } from "node:http";
import ResponseBuilder from "../../services/responseBulider.service.js";
import Database from "../../database/connection.js";
import DebugClass from "../../decorators/logger.decorator.js";
import type { ApiResponse } from "../../types/response.type.js";
import Input from "../../services/Input.service.js";
import type { User } from "../../types/user.type.js";
import bcrypt from "bcrypt";

DebugClass;
class Auth {
  private readonly builder: ResponseBuilder;

  constructor(private readonly db: Database) {
    this.builder = new ResponseBuilder();
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
        .collection("users")
        .insertOne({
          name: name,
          email: email,
          password: hashedPassword,
          type: type,
          isLoggedIn: false,
          lastLoginTime: null,
          lastLogoutTime: null,
        });

        data = {
            status: true,
            message: 'User created successfully.',
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

  // public async createUser (req: IncomingMessage, res: ServerResponse) {
  //     let data: ApiResponse;
  //     try {

  //     } catch (error) {
  //         const message = error instanceof Error ? error.message : 'Something went wrong!';

  //         data = {
  //             status: false,
  //             message: message,
  //             data: null
  //         }
  //         this.builder.sendJson(res, 500, data)
  //     }
  // }
}

export default Auth;
