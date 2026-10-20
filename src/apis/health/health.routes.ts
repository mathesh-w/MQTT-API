import authMiddleware from "../../middleware/auth.middleware.js";
import Router from "../../router/router.js";
import Health from "./health.js";


class HealthRoutes {

    constructor (
        private readonly router: Router,
        private readonly health: Health,
    ) 
    {}

    public configure (): void {
        this.router.get('/db-check', this.health.checkDb.bind(this.health), [authMiddleware]);
        this.router.get('/db-stats', this.health.dbStats.bind(this.health), [authMiddleware]);
        this.router.get('/db-collections', this.health.dbCollections.bind(this.health), [authMiddleware]);
    }

}

export default HealthRoutes;
