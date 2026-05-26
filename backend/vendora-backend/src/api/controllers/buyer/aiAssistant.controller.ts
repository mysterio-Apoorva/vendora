import { Request, Response, NextFunction } from 'express';
import aiAssistantService from '../../../services/ai-assistant.service';

export class AIAssistantController {
  /**
   * Chat with the AI Shopping Assistant
   * POST /api/buyer/ai/chat
   */
  async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'anonymous';
      const { message, history } = req.body;

      if (!message) {
        return res.status(400).json({ success: false, message: "Message is required" });
      }

      const response = await aiAssistantService.getChatResponse(userId, message, history);

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get budget-based suggestions
   * POST /api/buyer/ai/budget-suggestions
   */
  async getBudgetSuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const { budget, category } = req.body;

      if (!budget) {
        return res.status(400).json({ success: false, message: "Budget is required" });
      }

      const response = await aiAssistantService.getBudgetSuggestions(budget, category);

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get gift recommendations
   * POST /api/buyer/ai/gift-recommendations
   */
  async getGiftRecommendations(req: Request, res: Response, next: NextFunction) {
    try {
      const { occasion, recipient, budget } = req.body;

      if (!occasion || !recipient) {
        return res.status(400).json({ success: false, message: "Occasion and recipient are required" });
      }

      const response = await aiAssistantService.getGiftRecommendations(occasion, recipient, budget);

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AIAssistantController();
