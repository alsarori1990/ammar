import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface FoodLibraryItem {
  id: string;
  nameEn: string;
  nameAr: string;
  caloriesPer100g: number;
  protein: number;
  carbs: number;
  fat: number;
  source: string;
}

export async function searchFoodLibrary(searchTerm: string, language: string): Promise<FoodLibraryItem[]> {
  try {
    const response = await fetch('/api/food-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchTerm: searchTerm, language }),
    });

    if (!response.ok) {
      throw new Error('Failed to search');
    }

    const results: FoodLibraryItem[] = await response.json();

    // Fill in missing translations using AI to ensure both languages are always present
    const translatedResults = await Promise.all(results.map(async (item) => {
      // If we are missing Arabic name
      if (!item.nameAr) {
        try {
          const res = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: `Translate this food name to clinical/generic Arabic. Input: "${item.nameEn}". Return ONLY the Arabic name.`,
          });
          item.nameAr = res.text.trim();
        } catch (e) {
          item.nameAr = item.nameEn;
        }
      }
      
      // If we are missing English name
      if (!item.nameEn) {
        try {
          const res = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: `Translate this food name to a generic English food term. Input: "${item.nameAr}". Return ONLY the English name.`,
          });
          item.nameEn = res.text.trim();
        } catch (e) {
          item.nameEn = item.nameAr;
        }
      }
      
      return item;
    }));

    return translatedResults;
  } catch (error) {
    console.error("Library Search Error:", error);
    return [];
  }
}
