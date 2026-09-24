import { MongoClient, Db, Collection } from "mongodb";
import EnvConfig from "../config/env.js";

export default class Database {

    private readonly client: MongoClient;
    private db!: Db;

    constructor(private readonly env: EnvConfig) {
        this.client = new MongoClient(this.env.mongoUri);
    }

    public async connect(): Promise<void> {

        await this.client.connect();

        this.db = this.client.db(this.env.mongoDatabase);

        console.log(`Connected to ${this.env.mongoDatabase}`);
    }

    public getDatabase(): Db {

        if (!this.db) {
            throw new Error("Database is not connected");
        }

        return this.db;
    }

    public setCollection(collection: string): Collection {
        return this.db.collection(collection);
    }
}

