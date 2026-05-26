"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAssistantController = void 0;
const ai_assistant_service_1 = __importDefault(require("../../../services/ai-assistant.service"));
class AIAssistantController {
    /**
     * Chat with the AI Shopping Assistant
     * POST /api/buyer/ai/chat
     */
    async chat(req, res, next) {
        try {
            const userId = req.user?.id || 'anonymous';
            const { message, history } = req.body;
            if (!message) {
                return res.status(400).json({ success: false, message: "Message is required" });
            }
            const response = await ai_assistant_service_1.default.getChatResponse(userId, message, history);
            res.status(200).json({
                success: true,
                data: response,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get budget-based suggestions
     * POST /api/buyer/ai/budget-suggestions
     */
    async getBudgetSuggestions(req, res, next) {
        try {
            const { budget, category } = req.body;
            if (!budget) {
                return res.status(400).json({ success: false, message: "Budget is required" });
            }
            const response = await ai_assistant_service_1.default.getBudgetSuggestions(budget, category);
            res.status(200).json({
                success: true,
                data: response,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get gift recommendations
     * POST /api/buyer/ai/gift-recommendations
     */
    async getGiftRecommendations(req, res, next) {
        try {
            const { occasion, recipient, budget } = req.body;
            if (!occasion || !recipient) {
                return res.status(400).json({ success: false, message: "Occasion and recipient are required" });
            }
            const response = await ai_assistant_service_1.default.getGiftRecommendations(occasion, recipient, budget);
            res.status(200).json({
                success: true,
                data: response,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AIAssistantController = AIAssistantController;
exports.default = new AIAssistantController();
