import Router from "../../router/router.js";
import Auth from "./auth.js";


class AuthRoutes {

    constructor (
        private readonly router: Router,
        private readonly auth: Auth,
    ) 
    {}

    public configure (): void {
        this.router.post('/create-user', this.auth.createUser.bind(this.auth));
        this.router.post('/login', this.auth.login.bind(this.auth));
        this.router.post('/logout', this.auth.logout.bind(this.auth));
    }

}

export default AuthRoutes;
