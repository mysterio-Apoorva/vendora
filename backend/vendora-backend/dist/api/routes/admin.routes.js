"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = __importDefault(require("../controllers/shared/category.controller"));
const admin_controller_1 = __importDefault(require("../controllers/admin/admin.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Protect all admin routes
router.use(auth_middleware_1.authMiddleware);
router.use((0, role_middleware_1.roleMiddleware)([client_1.Role.ADMIN]));
// Platform Stats
router.get('/stats', admin_controller_1.default.getStats);
// Vendor Management
router.patch('/vendors/:id/status', admin_controller_1.default.updateVendorStatus);
// Category Management
router.post('/categories', category_controller_1.default.createCategory);
router.patch('/categories/:id', category_controller_1.default.updateCategory);
// Fraud Management
router.post('/fraud', admin_controller_1.default.flagFraud);
router.patch('/fraud/:id', admin_controller_1.default.updateFraudStatus);
// Commission Management
router.post('/commissions', admin_controller_1.default.setCommission);
exports.default = router;
