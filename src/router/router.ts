import type { IncomingMessage, ServerResponse } from "node:http";
import Route from "./route.js";
import Matcher from "./matcher.js";
import type { Handler } from "./types.js";
import type { Middleware } from "../middleware/middleware.type.js";


class Router {

    private readonly routes: Route[] = [];
    private readonly matcher: Matcher;

    constructor() {
        this.matcher = new Matcher();
    }

    
    public get(path: string, handler: Handler, middleware: Middleware[] = []): void {
        this.routes.push(
            new Route('GET', path, handler, middleware)
        );
    }

    public post(path: string, handler: Handler, middleware: Middleware[] = []): void {
        this.routes.push(
            new Route('POST', path, handler, middleware)
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

            response.end(JSON.stringify({
                status: false,
                message: "Route not found",
                data: null,
            }));

            return;
        }

        // route.handler(request, response);

        this.runMiddleware(
            route.middlewares,
            0,
            request,
            response,
            route.handler
        );
    }

    private runMiddleware(
    middleware: Middleware[],
    index: number,
    request: IncomingMessage,
    response: ServerResponse,
    handler: Handler
): void {
    if (response.writableEnded) return;

    if (index >= middleware.length) {
        // handler is typed as Handler (non-optional) — no error here.
        void Promise.resolve(handler(request, response)).catch(error => {
            console.error(error);
            if (!response.headersSent) {
                response.writeHead(500, { "content-type": "application/json" });
            }
            if (!response.writableEnded) {
                response.end(JSON.stringify({
                    status: false,
                    message: "Internal server error",
                    data: null,
                }));
            }
        });
        return;
    }

    const currentMiddleware = middleware[index];

    // Narrow: index < length guarantees this, but TS needs the check.
    if (!currentMiddleware) return;

    let nextCalled = false;
    const next = (): void => {
        if (nextCalled || response.writableEnded) return;
        nextCalled = true;
        this.runMiddleware(middleware, index + 1, request, response, handler);
    };

    void Promise.resolve(currentMiddleware(request, response, next)).catch(error => {
        console.error(error);
        if (!response.headersSent) {
            response.writeHead(500, { "content-type": "application/json" });
        }
        if (!response.writableEnded) {
            response.end(JSON.stringify({
                status: false,
                message: "Internal server error",
                data: null,
            }));
        }
    });
}
    
}

export default Router;