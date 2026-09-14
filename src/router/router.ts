import type { IncomingMessage, ServerResponse } from "node:http";
import Route from "./route.js";
import Matcher from "./matcher.js";
import type { Handler } from "./types.js";


class Router {

    private readonly routes: Route[] = [];
    private readonly matcher: Matcher;

    constructor() {
        this.matcher = new Matcher();
    }

    
    public get(path: string, handler: Handler): void {
        this.routes.push(
            new Route('GET', path, handler)
        );
    }

    public post(path: string, handler: Handler): void {
        this.routes.push(
            new Route('POST', path, handler)
        );
    }

    public handle(request: IncomingMessage, response: ServerResponse) {

        const route = this.routes.find(route => 
            this.matcher.match(request, route)
        )

        if (!route) {
            response.writeHead(400, {
                'content-type': 'application/json'
            });

            response.end(
                JSON.stringify({
                    message: 'Route not found'
                })
            )

            return;
        }

        route.handler(request, response);
    }
    
}

export default Router;