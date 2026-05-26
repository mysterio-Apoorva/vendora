"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_controller_1 = __importDefault(require("../controllers/vendor/inventory.controller"));
const orderFulfillment_controller_1 = __importDefault(require("../controllers/vendor/orderFulfillment.controller"));
const vendor_controller_1 = __importDefault(require("../controllers/vendor/vendor.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Protect all routes with authentication
router.use(auth_middleware_1.authMiddleware);
// Public vendor registration (for any authenticated user)
router.post('/register', vendor_controller_1.default.register);
// Role-based protection for vendor-only routes
router.use((0, role_middleware_1.roleMiddleware)([client_1.Role.VENDOR]));
// Dashboard & Profile
router.get('/dashboard', vendor_controller_1.default.getDashboard);
router.get('/profile', vendor_controller_1.default.getProfile);
router.patch('/profile', vendor_controller_1.default.updateProfile);
// Product Management
router.post('/products', inventory_controller_1.default.createProduct);
router.get('/products', inventory_controller_1.default.getMyProducts);
router.patch('/products/:id', inventory_controller_1.default.updateProduct);
router.delete('/products/:id', inventory_controller_1.default.deleteProduct);
// Variant Management
router.post('/products/:productId/variants', inventory_controller_1.default.addVariant);
router.patch('/variants/:id', inventory_controller_1.default.updateVariant);
router.delete('/variants/:id', inventory_controller_1.default.deleteVariant);
// Order Fulfillment
router.get('/orders', orderFulfillment_controller_1.default.getMyOrders);
router.patch('/orders/:itemId/status', orderFulfillment_controller_1.default.updateStatus);
exports.default = router;
