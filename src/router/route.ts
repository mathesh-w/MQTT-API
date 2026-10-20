import type { Middleware } from "../middleware/middleware.type.js";
import type { Handler } from "./types.js";

class Route {

    constructor(
        public readonly method: string,
        public readonly path: string,
        public readonly handler: Handler,
        public readonly middlewares: Middleware[] = []
    ) {}

}

export default Route;