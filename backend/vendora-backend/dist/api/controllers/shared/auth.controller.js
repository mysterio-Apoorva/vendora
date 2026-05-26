"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const errors_1 = require("../../../utils/errors");
class AuthController {
    /**
     * Sync Clerk user with local DB
     * This would typically be called by a webhook or after frontend login
     */
    async syncUser(req, res, next) {
        try {
            const { clerkId, email, name, avatarUrl } = req.body;
            if (!clerkId || !email) {
                throw new errors_1.BadRequestError('Missing required user data');
            }
            const user = await prisma_1.default.user.upsert({
                where: { clerkId },
                update: {
                    email,
                    name,
                    avatarUrl,
                },
                create: {
                    clerkId,
                    email,
                    name,
                    avatarUrl,
                },
            });
            res.status(200).json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get current user profile
     */
    async getProfile(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new Error('User not found');
            const user = await prisma_1.default.user.findUnique({
                where: { id: userId },
                include: { vendorProfile: true },
            });
            res.status(200).json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.default = new AuthController();
