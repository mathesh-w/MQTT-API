import Router from "../../router/router.js";
import Auth from "./auth.js";


class HealthRoutes {

    constructor (
        private readonly router: Router,
        private readonly auth: Auth,
    ) 
    {}

    public configure (): void {
        this.router.post('/create-user', this.auth.createUser.bind(this.auth));
        // this.router.get('/db-stats', this.health.dbStats.bind(this.health));
        // this.router.get('/db-collections', this.health.dbCollections.bind(this.health));
    }

}

export default HealthRoutes;
