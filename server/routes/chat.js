import express from 'express';

const router = express.Router();

// POST /api/chat
router.post('/chat', async (req, res) => {
    try {
        const { message, userGoals, image, conversationHistory } = req.body;

        if (!message && !image) {
            return res.status(400).json({ error: 'Message or image is required' });
        }

        // Build context-aware system prompt
        let systemPrompt = `You are Fitly AI, a friendly and knowledgeable fitness and nutrition assistant.

Guidelines:
- Keep responses SHORT and CRISP (2-4 sentences or bullet points)
- Use emojis sparingly for emphasis (✅ ⚠️ 🍽️)
- Always structure feedback as:
  ✅ What's good
  ⚠️ What to improve  
  🍽️ Better alternatives (if applicable)
- Be encouraging but honest
- Focus on practical, actionable advice`;

        if (userGoals) {
            systemPrompt += `

User's Daily Goals:
- Calories: ${userGoals.calories || 2000} kcal
- Protein: ${userGoals.protein || 150}g
- Carbs: ${userGoals.carbs || 200}g
- Fat: ${userGoals.fat || 65}g

Always evaluate meals and suggestions against these targets.`;
        }

        // Build messages array
        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        // Add conversation history if provided
        if (conversationHistory && Array.isArray(conversationHistory)) {
            messages.push(...conversationHistory);
        }

        // Build user message
        const userMessage = {
            role: 'user',
            content: []
        };

        if (message) {
            userMessage.content.push({
                type: 'text',
                text: message
            });
        }

        if (image) {
            userMessage.content.push({
                type: 'image_url',
                image_url: {
                    url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`
                }
            });
        }

        // If only text, simplify to string
        if (userMessage.content.length === 1 && userMessage.content[0].type === 'text') {
            userMessage.content = userMessage.content[0].text;
        }

        messages.push(userMessage);

        const apiKey = process.env.OPENROUTER_API_KEY;

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
                model: 'openai/gpt-4o-mini',
                messages,
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error text');
            console.error('❌ OpenRouter Error Details:', errorText);

            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                errorData = { raw: errorText };
            }
            throw new Error(errorData.error?.message || `OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content;

        if (!aiResponse) {
            throw new Error('No response from AI');
        }

        res.json({
            message: aiResponse,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            error: 'Failed to get AI response',
            message: error.message
        });
    }
});

export default router;
