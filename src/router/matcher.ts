import type { IncomingMessage } from "node:http";
import Route from "./route.js";

class Matcher {

    public match(
        request: IncomingMessage,
        route: Route
    ): boolean {

        const url = new URL(
            request.url ?? '', 
            `http://${request.headers.host}`
        )
        
        return (
            request.method === route.method &&
            url.pathname === route.path
        );
    }

}

export default Matcher;