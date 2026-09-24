import type {ApiResponse} from '../types/response.type.js'
import { ServerResponse } from "http";

class ResponseBuilder {
    
    public sendJson(res: ServerResponse, status: number, data: ApiResponse): void {
        res.writeHead(status, {'content-type': 'application/json'});
        res.end(JSON.stringify(data))
    }

}

export default ResponseBuilder;