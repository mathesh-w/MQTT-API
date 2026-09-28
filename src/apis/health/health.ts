import DebugClass from "../../decorators/logger.decorator.js";
import type { IncomingMessage, ServerResponse } from "http";
import ResponseBuilder from "../../services/responseBulider.service.js";
import Database from "../../database/connection.js";
import type { ApiResponse } from "../../types/response.type.js";
import type { CollectionInfo, DatabaseHealth, DatabaseStats } from "../../types/dbHealth.type.js";

@DebugClass
class Health {

    private readonly builder;

    constructor (private readonly db: Database) {
        this.builder = new ResponseBuilder();
    }

    public async checkDb (req: IncomingMessage, res: ServerResponse) {
        let data: ApiResponse;
        const start = Date.now();
        let health: DatabaseHealth;
        let dbName = '';
        try {
            const database = this.db.getDatabase();
            await database.command({ping: 1});

            dbName = database.databaseName;

            health = {
                status: 'up',
                latencyMs: Date.now() - start,
                database: database.databaseName
            };

            data = {
                status: true,
                message: 'Mongo health is good.',
                data: health
            }

            this.builder.sendJson(res, 200, data);
        } catch (error) {

            const message = error instanceof Error ? error.message : 'Something went wrong!';

            health = {
                status: "down",
                latencyMs: Date.now() - start,
                database: dbName
            };

            data = {
                status: false,
                message: message,
                data: health
            }

            this.builder.sendJson(res, 500, data);

        }
    }

    public async dbStats (req: IncomingMessage, res: ServerResponse) {
        let data: ApiResponse;
        const start = Date.now();
        let result: DatabaseStats;
        let dbName = '';
        try {
            const database = this.db.getDatabase();
            await database.command({ping: 1});
            const stats = await database.stats();

            dbName = database.databaseName;

            result = {
                database: stats.db,
                collections: stats.collections,
                documents: stats.objects,
                dataSizeBytes: stats.dataSize,
                storageSizeBytes: stats.storageSize,
                indexes: stats.indexes,
                avgObjectSize: stats.avgObjSize ?? 0,
                latencyMs: Date.now() - start
            };


            data = {
                status: true,
                message: 'Mongo health is good.',
                data: result
            }

            this.builder.sendJson(res, 200, data);
        } catch (error) {

            const message = error instanceof Error ? error.message : 'Something went wrong!';

            result = {
                latencyMs: Date.now() - start,
                database: dbName
            };

            data = {
                status: false,
                message: message,
                data: result
            }

            this.builder.sendJson(res, 500, data);

        }
    }

    public async dbCollections (req: IncomingMessage, res: ServerResponse) {
        let data: ApiResponse;
        let result: CollectionInfo[] = [];
        let dbName = '';
        try {
            const database = this.db.getDatabase();
            const collections = await database.listCollections().toArray();

            dbName = database.databaseName;

            for (const col of collections) {
                
                const records = await database.collection(col.name).estimatedDocumentCount();
                const indexes = await database.collection(col.name).indexes();
                
                result.push({
                    name: col.name,
                    numberIndexs: indexes.length,
                    records
                });

            }


            data = {
                status: true,
                message: 'Collections list.',
                data: result
            }

            this.builder.sendJson(res, 200, data);
        } catch (error) {

            const message = error instanceof Error ? error.message : 'Something went wrong!';

            data = {
                status: false,
                message: message,
                data: null
            }

            this.builder.sendJson(res, 500, data);

        }
    }

}

export default Health;