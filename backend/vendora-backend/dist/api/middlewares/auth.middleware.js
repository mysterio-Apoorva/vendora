"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const errors_1 = require("../../utils/errors");
const prisma_1 = __importDefault(require("../../config/prisma"));
/**
 * Simple authentication middleware
 * In production, this would verify Clerk JWTs
 */
const authMiddleware = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            throw new errors_1.UnauthorizedError('Authentication required');
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            include: { vendorProfile: true },
        });
        if (!user || !user.isActive) {
            throw new errors_1.UnauthorizedError('User not found or inactive');
        }
        // Attach user to request
        req.user = {
            id: user.id,
            clerkId: user.clerkId,
            role: user.role,
            vendorId: user.vendorProfile?.id,
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authMiddleware = authMiddleware;
