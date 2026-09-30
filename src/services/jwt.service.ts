
import jwt from "jsonwebtoken";
import EnvConfig from "../config/env.js";

class JWT {
    private readonly env: EnvConfig;

    constructor() {
        this.env = new EnvConfig();
    }

    public generate(payload: object): string {
        return jwt.sign(
            payload,
            this.env.jwtSecret,
            {expiresIn: this.env.jwtExpiresIn}
        );
    }

    public verify(token: string): object {
        return jwt.verify(
            token,
            this.env.jwtSecret,
        ) as object;
    }
}