import type { IncomingMessage } from "node:http";
import Route from "./route.js";

class Matcher {

    public match(
        request: IncomingMessage,
        route: Route
    ): boolean {
        
        return (
            request.method === route.method &&
            request.url === route.path
        );
    }

}

export default Matcher;