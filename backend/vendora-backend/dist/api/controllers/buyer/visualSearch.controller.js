"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisualSearchController = exports.uploadMiddleware = void 0;
const visual_search_service_1 = __importDefault(require("../../../services/visual-search.service"));
const multer_1 = __importDefault(require("multer"));
// Configure multer for memory storage
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        }
        else {
            cb(new Error("Only images are allowed"));
        }
    }
});
exports.uploadMiddleware = upload.single('image');
class VisualSearchController {
    /**
     * Search products by image
     * POST /api/buyer/visual-search
     */
    async search(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Please upload an image"
                });
            }
            const result = await visual_search_service_1.default.searchByImage(req.file.buffer, req.file.mimetype);
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.VisualSearchController = VisualSearchController;
exports.default = new VisualSearchController();
