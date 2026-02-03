import express from 'express';

const router = express.Router();

/**
 * POST /api/food-search
 * Searches for food items using AI based on a text query
 */
router.post('/food-search', async (req, res) => {
    try {
        const { query } = req.body;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const q = query.trim();
        if (!q) {
            return res.json({ foods: [] });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            console.error('OPENROUTER_API_KEY is not configured on the server.');
            return res.status(500).json({ error: 'AI Search is not configured' });
        }

        // Call OpenRouter API
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:5173',
                'X-Title': 'Fitly Nutrition Tracker'
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o-mini', // Cost-effective and fast
                messages: [
                    {
                        role: 'system',
                        content: 'You are a nutritional database. Return a JSON array of 5 top food items matching the search query. For each item, provide: name (descriptive, includes portion size), calories (int), protein (float), carbs (float), fat (float), and icon (a single relevant emoji). Return ONLY the JSON object with a "foods" key containing the array.'
                    },
                    {
                        role: 'user',
                        content: `Search query: ${q}`
                    }
                ],
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('OpenRouter API error:', errorData);
            throw new Error(errorData.error?.message || `OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            return res.json({ foods: [] });
        }

        let parsed;
        try {
            parsed = JSON.parse(content);
        } catch (parseError) {
            console.error('Failed to parse AI response:', content);
            throw new Error('AI response was not valid JSON');
        }

        const foods = (parsed.foods || []).map(f => ({
            name: f.name || 'Unknown',
            calories: Math.round(Number(f.calories) || 0),
            protein: Math.round((Number(f.protein) || 0) * 10) / 10,
            carbs: Math.round((Number(f.carbs) || 0) * 10) / 10,
            fat: Math.round((Number(f.fat) || 0) * 10) / 10,
            icon: f.icon || '🍽'
        }));

        res.json(foods);

    } catch (error) {
        console.error('Food search error:', error);
        res.status(500).json({
            error: 'Failed to search for foods',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

export default router;
