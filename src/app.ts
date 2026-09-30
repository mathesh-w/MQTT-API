import type { IncomingMessage, ServerResponse, Server } from "http";
import http from 'node:http';
import Router from "./router/router.js";
import ReadingApi from "./apis/reading/reading.js";
import Database from "./database/connection.js";
import ReadingRoutes from "./apis/reading/reading.routes.js";
import Health from "./apis/health/health.js";
import HealthRoutes from "./apis/health/health.routes.js";
import Auth from "./apis/auth/auth.js";
import AuthRoutes from "./apis/auth/auth.routes.js";

class App {

    private readonly server: Server;
    private readonly router: Router;

    private readonly readingApi: ReadingApi;
    private readonly readingRoutes: ReadingRoutes;

    private readonly health: Health;
    private readonly healthRoutes: HealthRoutes;

    private readonly auth: Auth;
    private readonly authRoutes: AuthRoutes;

    constructor(
        private readonly port: number,
        private readonly db: Database,
    ){

        this.router = new Router();

        this.readingApi = new ReadingApi(this.db);
        this.readingRoutes = new ReadingRoutes(this.router, this.readingApi);

        this.health = new Health(this.db);
        this.healthRoutes = new HealthRoutes(this.router, this.health)

        this.auth = new Auth(this.db);
        this.authRoutes = new AuthRoutes(this.router, this.auth)

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

        this.readingRoutes.configure();
        this.healthRoutes.configure();
        this.authRoutes.configure();

        
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