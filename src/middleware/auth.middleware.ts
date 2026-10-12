import JWT from "../services/jwt.service.js";
import ResponseBuilder from "../services/responseBulider.service.js";
import type { Middleware } from "./middleware.type.js";


const jwt = new JWT();
const builder = new ResponseBuilder();

const authMiddleware: Middleware = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization?.startsWith('Bearer ')) {
            return builder.sendJson(res, 401, {
                status: false,
                message: 'Authorization token is required!',
                data: null
            })
        }

        const token = authorization.slice(7).trim();
        if (!token) {
            return builder.sendJson(res, 401, {
                status: false,
                message: 'Authorization token is required!',
                data: null
            })
        }

        const verifiedToken = await jwt.verify(token);
        if (!verifiedToken) {
            return builder.sendJson(res, 401, {
                status: false,
                message: 'Invalid or expired token!',
                data: null
            })
        }

        next();
    } catch (error) {
        return builder.sendJson(res, 401, {
            status: false,
            message: "Invalid or expired token!",
            data: null,
        });
    }
}

export default authMiddleware;