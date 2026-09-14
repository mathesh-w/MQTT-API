import EnvConfig from './src/config/env.js';
import Database from './src/database/connection.js';
import App from './src/app.js';


class Server {

    private readonly env: EnvConfig;
    private readonly database: Database;
    private readonly app: App;

    constructor() {
        this.env = new EnvConfig();
        this.database = new Database(this.env);
        this.app = new App(this.env.apiPort);
    }

    public async start(): Promise<void> {
        await this.database.connect();
        this.app.start();
    }

}

const server = new Server();
server.start();