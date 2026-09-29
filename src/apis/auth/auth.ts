
import { ServerResponse, IncomingMessage } from "node:http";
import ResponseBuilder from "../../services/responseBulider.service.js";
import Database from "../../database/connection.js";
import DebugClass from "../../decorators/logger.decorator.js";
import type { ApiResponse } from "../../types/response.type.js";
import Input from "../../services/Input.service.js";
import type  { User } from "../../types/user.type.js";
import { userInfo } from "node:os";

DebugClass;
class Auth {

    private readonly builder: ResponseBuilder;

    constructor (private readonly db: Database) {
        this.builder = new ResponseBuilder();
    }

    public async createUser (req: IncomingMessage, res: ServerResponse) {
        let data: ApiResponse;
        try {
            const input = new Input(req);
            const body = await input.post();
            const postVal = body ? JSON.parse(body) : {};

            const name = postVal.name ?? '';
            const type = postVal.type ?? '';
            const email = postVal.email ?? '';
            const password = postVal.password ?? '';

            if (name === null || typeof name !== "string") {
                this.builder.sendJson(res, 422, {status: false, message: 'Name is requied!', data: null})
            }

            if (type === null || typeof type !== "string") {
                this.builder.sendJson(res, 422, {status: false, message: 'Type is requied!', data: null})
            }

            if (email === null || typeof email !== "string") {
                this.builder.sendJson(res, 422, {status: false, message: 'Email is requied!', data: null})
            }

            if (email === null || typeof email !== "string") {
                this.builder.sendJson(res, 422, {status: false, message: 'Password is requied!', data: null})
            }

            

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Something went wrong!';

            data = {
                status: false,
                message: message,
                data: null
            }
            this.builder.sendJson(res, 500, data)
        }
    }

    public async login (req: IncomingMessage, res: ServerResponse) {
        let data: ApiResponse;
        try {

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Something went wrong!';

            data = {
                status: false,
                message: message,
                data: null
            }
            this.builder.sendJson(res, 500, data)
        }
    }

    public async logout (req: IncomingMessage, res: ServerResponse) {
        let data: ApiResponse;
        try {

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Something went wrong!';

            data = {
                status: false,
                message: message,
                data: null
            }
            this.builder.sendJson(res, 500, data)
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