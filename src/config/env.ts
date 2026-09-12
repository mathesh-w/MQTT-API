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
}

