"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const zod_1 = require("zod");
const errors_1 = require("../../utils/errors");
const errorMiddleware = (err, req, res, next) => {
    console.error(`Error: ${err.message}`, { stack: err.stack });
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: err.errors,
        });
    }
    if (err instanceof errors_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }
    // Handle common Prisma errors
    if (err.code === 'P2002') {
        return res.status(400).json({
            success: false,
            message: 'Duplicate field value entered',
        });
    }
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
exports.errorMiddleware = errorMiddleware;
