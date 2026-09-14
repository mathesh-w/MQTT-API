import type { Handler } from "./types.js";

class Route {

    constructor(
        public readonly method: string,
        public readonly path: string,
        public readonly handler: Handler,
    ) {}

}

export default Route;