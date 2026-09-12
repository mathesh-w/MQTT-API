import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (
    req: IncomingMessage,
    res: ServerResponse,
) => void;