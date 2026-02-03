import express from 'express';

const router = express.Router();

// POST /api/food-scan
router.post('/food-scan', async (req, res) => {
    try {
        const { image, userGoals } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'Image is required' });
        }

        // Prepare the prompt for AI
        const systemPrompt = `You are a nutrition expert. Analyze the food image and provide a detailed nutrition breakdown.
Return ONLY a valid JSON object with this exact structure:
{
  "meal_name": "brief meal description",
  "foods_detected": [
    { "name": "food item", "confidence": 0.0-1.0, "portion": "estimated portion" }
  ],
  "nutrition_estimate": {
    "calories_kcal": 0,
    "protein_g": 0,
    "carbs_g": 0,
    "fat_g": 0,
    "fiber_g": 0,
    "sugar_g": 0,
    "sodium_mg": 0
  },
  "plan_assessment": {
    "is_healthy": true/false,
    "notes": ["brief note"],
    "alternatives": ["suggestion"]
  }
}`;

        let assessmentContext = '';
        if (userGoals) {
            assessmentContext = `
User's daily goals: ${userGoals.calories || 2000} calories, ${userGoals.protein || 150}g protein, ${userGoals.carbs || 200}g carbs, ${userGoals.fat || 65}g fat.
In plan_assessment, evaluate if this meal fits their goals and suggest improvements.`;
        }

        // Call OpenRouter API
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:5173',
                'X-Title': 'Fitly Nutrition Tracker'
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt + assessmentContext
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'Analyze this meal and provide nutrition information in the JSON format specified.'
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`
                                }
                            }
                        ]
                    }
                ],
                temperature: 0.3,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('OpenRouter API error:', errorData);
            throw new Error(errorData.error?.message || `OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content;

        if (!aiResponse) {
            throw new Error('No response from AI');
        }

        // Parse JSON from AI response
        let result;
        try {
            // Try to extract JSON if AI wrapped it in markdown
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            result = JSON.parse(jsonMatch ? jsonMatch[0] : aiResponse);
        } catch (parseError) {
            console.error('Failed to parse AI response:', aiResponse);
            throw new Error('AI response was not valid JSON');
        }

        // Validate structure
        if (!result.meal_name || !result.foods_detected || !result.nutrition_estimate) {
            throw new Error('AI response missing required fields');
        }

        res.json(result);

    } catch (error) {
        console.error('Food scan error:', error);
        res.status(500).json({
            error: 'Failed to analyze meal',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

export default router;
