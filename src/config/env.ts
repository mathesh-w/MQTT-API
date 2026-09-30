import dotenv from "dotenv";

dotenv.config();

export default class EnvConfig {

    public get mongoUri(): string {
        return process.env.MONGO_URI!;
    }

    public get mongoDatabase(): string {
        return process.env.MONGO_DATABASE!;
    }

    public get apiPort(): number {
        return Number(process.env.API_PORT);
    }

    public get jwtExpiresIn(): number {
        return Number(process.env.JWT_EXPIRE_IN);
    }

    public get jwtSecret(): number {
        return Number(process.env.JWT_SCERET);
    }
}

