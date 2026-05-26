"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = void 0;
const errors_1 = require("../../utils/errors");
const roleMiddleware = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !roles.includes(user.role)) {
            throw new errors_1.ForbiddenError('Insufficient permissions');
        }
        next();
    };
};
exports.roleMiddleware = roleMiddleware;
