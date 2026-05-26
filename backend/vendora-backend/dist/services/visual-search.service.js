"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisualSearchService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const prisma_1 = __importDefault(require("../config/prisma"));
const env_1 = __importDefault(require("../config/env"));
const client_1 = require("@prisma/client");
class VisualSearchService {
    genAI;
    model;
    constructor() {
        this.genAI = new generative_ai_1.GoogleGenerativeAI(env_1.default.GEMINI_API_KEY || "");
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
    /**
     * Analyze image and find similar products
     */
    async searchByImage(imageBuffer, mimeType) {
        const prompt = `
      Analyze this image and identify the primary product shown. 
      Return a JSON object with the following fields:
      - productName: a concise name for the product
      - category: the general category (e.g., Electronics, Fashion, Home)
      - attributes: an array of key features (e.g., color, material, brand if visible)
      - keywords: 3-5 keywords for searching similar products
      
      Only return the JSON object, nothing else.
    `;
        const imageParts = [
            {
                inlineData: {
                    data: imageBuffer.toString("base64"),
                    mimeType
                },
            },
        ];
        const result = await this.model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();
        // Parse the AI response
        let analysis;
        try {
            // Clean the response if AI wraps it in markdown code blocks
            const cleanedJson = text.replace(/```json|```/g, "").trim();
            analysis = JSON.parse(cleanedJson);
        }
        catch (error) {
            console.error("Failed to parse AI response:", text);
            throw new Error("Could not analyze image accurately");
        }
        // Use keywords and category to find similar products in the database
        const similarProducts = await prisma_1.default.product.findMany({
            where: {
                status: client_1.ProductStatus.ACTIVE,
                OR: [
                    { name: { contains: analysis.productName, mode: 'insensitive' } },
                    { category: { name: { contains: analysis.category, mode: 'insensitive' } } },
                    ...analysis.keywords.map((keyword) => ({
                        name: { contains: keyword, mode: 'insensitive' }
                    })),
                    ...analysis.keywords.map((keyword) => ({
                        description: { contains: keyword, mode: 'insensitive' }
                    }))
                ]
            },
            take: 10,
            include: {
                category: { select: { name: true } },
                vendor: { select: { storeName: true } }
            }
        });
        return {
            analysis,
            products: similarProducts
        };
    }
}
exports.VisualSearchService = VisualSearchService;
exports.default = new VisualSearchService();
