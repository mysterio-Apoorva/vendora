"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAssistantService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const prisma_1 = __importDefault(require("../config/prisma"));
const env_1 = __importDefault(require("../config/env"));
const client_1 = require("@prisma/client");
class AIAssistantService {
    genAI;
    model;
    constructor() {
        this.genAI = new generative_ai_1.GoogleGenerativeAI(env_1.default.GEMINI_API_KEY || "");
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
    /**
     * Get conversational product recommendations based on user query
     */
    async getChatResponse(userId, userMessage, chatHistory = []) {
        // 1. Fetch available products to provide context to the AI
        // In a large catalog, we would use semantic search or vector embeddings here.
        // For now, we fetch a relevant subset or featured products.
        const products = await prisma_1.default.product.findMany({
            where: { status: client_1.ProductStatus.ACTIVE },
            take: 20,
            select: {
                id: true,
                name: true,
                price: true,
                description: true,
                category: { select: { name: true } },
                slug: true,
            },
        });
        const productContext = products.map(p => `ID: ${p.id}, Name: ${p.name}, Price: INR ${p.price}, Category: ${p.category?.name}, Description: ${p.description?.substring(0, 100)}...`).join("\n");
        const systemPrompt = `
      You are Vendora's AI Shopping Assistant. Your goal is to help users find the best products from our catalog.
      
      Catalog Context:
      ${productContext}
      
      Instructions:
      1. Be helpful, friendly, and conversational.
      2. Recommend specific products from the context above if they match the user's needs.
      3. If a user asks for something not in context, suggest similar categories we might have.
      4. For budget-based requests, prioritize products within the specified price range.
      5. For gift recommendations, ask follow-up questions about the recipient if needed.
      6. Always include the product name and price in your recommendations.
      7. Format your response in Markdown.
      8. If you recommend a product, format it like this: [Product Name](https://vendora.com/products/slug).
    `;
        const chat = this.model.startChat({
            history: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "Understood. I am ready to assist Vendora shoppers." }] },
                ...chatHistory.map(h => ({ role: h.role, parts: [{ text: h.parts }] }))
            ],
        });
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        return response.text();
    }
    /**
     * Specialized budget-based suggestions
     */
    async getBudgetSuggestions(budget, category) {
        const products = await prisma_1.default.product.findMany({
            where: {
                status: client_1.ProductStatus.ACTIVE,
                price: { lte: budget },
                ...(category ? { category: { name: { contains: category, mode: 'insensitive' } } } : {})
            },
            take: 5,
            orderBy: { rating: 'desc' },
            include: { category: true }
        });
        if (products.length === 0) {
            return "I couldn't find any products within that budget. Would you like to see our most popular items instead?";
        }
        const prompt = `
      The user has a budget of INR ${budget}${category ? ` for ${category}` : ""}.
      Recommend the following products to them in a friendly way:
      ${products.map(p => `${p.name} at INR ${p.price}`).join(", ")}
    `;
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }
    /**
     * Specialized gift recommendations
     */
    async getGiftRecommendations(occasion, recipient, budget) {
        const prompt = `
      Suggest 3 gift ideas for a ${occasion} for a ${recipient}${budget ? ` with a budget of INR ${budget}` : ""}.
      Be creative and helpful. 
    `;
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }
}
exports.AIAssistantService = AIAssistantService;
exports.default = new AIAssistantService();
