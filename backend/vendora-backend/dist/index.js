"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = require("http");
const env_1 = __importDefault(require("./config/env"));
const routes_1 = __importDefault(require("./api/routes"));
const error_middleware_1 = require("./api/middlewares/error.middleware");
const socket_1 = require("./config/socket");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Initialize Socket.io
(0, socket_1.initSocket)(httpServer);
// Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api', routes_1.default);
// Error Handling
app.use(error_middleware_1.errorMiddleware);
const PORT = env_1.default.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Vendora Backend running on port ${PORT} in ${env_1.default.NODE_ENV} mode`);
});
