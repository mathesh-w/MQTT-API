import type { IncomingMessage, Server, ServerResponse } from "node:http";
import http from 'http';

class App {

    private readonly server: Server;
    private readonly port: number;

    constructor(port: number) {
        this.port = port;
    }

    requestHandler(request: IncomingMessage, response: ServerResponse) {
        this
    }

    start(): Server {
        this.server.listen(this.port, () => {
            console.log(`Server running on http://localhost:${this.port}`)
        });

        return this.server;
    }

    
}