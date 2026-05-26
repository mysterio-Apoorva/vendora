import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../config/prisma";
import env from "../config/env";
import { ProductStatus } from "@prisma/client";

export class VisualSearchService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || "");
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  /**
   * Analyze image and find similar products
   */
  async searchByImage(imageBuffer: Buffer, mimeType: string) {
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
    } catch (error) {
      console.error("Failed to parse AI response:", text);
      throw new Error("Could not analyze image accurately");
    }

    // Use keywords and category to find similar products in the database
    const similarProducts = await prisma.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        OR: [
          { name: { contains: analysis.productName, mode: 'insensitive' } },
          { category: { name: { contains: analysis.category, mode: 'insensitive' } } },
          ...analysis.keywords.map((keyword: string) => ({
            name: { contains: keyword, mode: 'insensitive' }
          })),
          ...analysis.keywords.map((keyword: string) => ({
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

export default new VisualSearchService();
