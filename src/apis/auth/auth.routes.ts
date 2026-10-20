import authMiddleware from "../../middleware/auth.middleware.js";
import Router from "../../router/router.js";
import Auth from "./auth.js";


class AuthRoutes {

    constructor (
        private readonly router: Router,
        private readonly auth: Auth,
    ) 
    {}

    public configure (): void {
        this.router.post('/create-user', this.auth.createUser.bind(this.auth), [authMiddleware]);
        this.router.post('/login', this.auth.login.bind(this.auth), [authMiddleware]);
        this.router.post('/logout', this.auth.logout.bind(this.auth), [authMiddleware]);
    }

}

export default AuthRoutes;
