import type { IncomingMessage, ServerResponse, Server } from "http";
import http from 'node:http';
import Router from "./router/router.js";
import ReadingApi from "./apis/reading.js";

class App {

    private readonly server: Server;
    private readonly router: Router;

    private readonly readingApi: ReadingApi;

    constructor(private readonly port: number){

        this.router = new Router();
        this.readingApi = new ReadingApi();

        this.configurRoutes();

        this.server = http.createServer(
            (req: IncomingMessage, res: ServerResponse) => {
                this.requestHandler(req, res)
            }
        )
        
    }

    private configurRoutes(): void {

        this.router.get(
            '/', 
            (req, res) => {
                res.writeHead(200, {
                    'content-type': 'application/json'
                });

                res.end(
                    JSON.stringify({
                        message: 'API is working'
                    })
                )
            }
        )

        this.router.get(
            '/readings',
            this.readingApi.getReadings.bind(this.readingApi)
        );
    }

    private requestHandler(
        request: IncomingMessage,
        response: ServerResponse
    ): void {
        this.router.handle(request, response);
    }

    public start(): Server {

        this.server.listen(this.port, () => {
            console.log(
                `Server running on http://localhost:${this.port}`
            );
        });

        return this.server;
    }

}

export default App;