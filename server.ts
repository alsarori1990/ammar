import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Food Library Search
  app.post('/api/food-search', async (req, res) => {
    const { searchTerm } = req.body;

    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    try {
      // Helper function to search OFF
      const searchOFF = async (term: string) => {
        const offUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(term)}&search_simple=1&json=1&page_size=20`;
        const response = await fetch(offUrl);
        if (!response.ok) return [];
        const json: any = await response.json();
        return json.products || [];
      };

      // 1. Search with user's term
      let products = await searchOFF(searchTerm);

      // 2. If few results, search with English equivalent for generic items
      // (This helps find "Boiled Egg" if "بيض مسلوق" isn't indexed well)
      if (products.length < 3 && /[\u0600-\u06FF]/.test(searchTerm)) {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
        const transResult = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: `Translate this food name to a simple English term for a nutrition search. Input: "${searchTerm}". Return ONLY the name.`,
        });
        const engTerm = transResult.text.trim();
        const engProducts = await searchOFF(engTerm);
        products = [...products, ...engProducts];
      }

      const results: any[] = [];
      const seenIds = new Set();

      products.forEach((p: any) => {
        if (seenIds.has(p._id)) return;
        seenIds.add(p._id);

        const nameAr = p.product_name_ar || (p.product_name && /[\u0600-\u06FF]/.test(p.product_name) ? p.product_name : '');
        const nameEn = p.product_name_en || p.product_name || '';
        
        const calories = p.nutriments?.['energy-kcal_100g'] || p.nutriments?.['energy-kcal_serving'] || p.nutriments?.['energy-kcal'] || 0;
        
        if (nameEn || nameAr) {
          results.push({
            id: p._id || Math.random().toString(),
            nameEn: nameEn,
            nameAr: nameAr,
            caloriesPer100g: Math.round(calories),
            protein: p.nutriments?.proteins_100g || 0,
            carbs: p.nutriments?.carbohydrates_100g || 0,
            fat: p.nutriments?.fat_100g || 0,
            source: 'Open Food Facts'
          });
        }
      });

      res.json(results);
    } catch (error) {
      console.error('Food Library Search Error:', error);
      res.status(500).json({ error: 'Failed to fetch food data' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
