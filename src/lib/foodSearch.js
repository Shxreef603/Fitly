const OPENROUTER_API = "https://openrouter.ai/api/v1/chat/completions";

/**
 * @param {string} query
 * @param {{ limit?: number }} opts
 * @returns {Promise<Array<{ name: string, calories: number, protein: number, carbs: number, fat: number, icon: string }>>}
 */
export async function searchFoods(query, opts = {}) {
  const q = (query || "").trim();
  if (!q) return [];

  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("OpenRouter API key not found in environment variables.");
    return [];
  }

  try {
    const response = await fetch(OPENROUTER_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Fitly Nutrient Tracker",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // Cost-effective and fast
        messages: [
          {
            role: "system",
            content: "You are a nutritional database. Return a JSON array of 5 top food items matching the search query. For each item, provide: name (descriptive, includes portion size), calories (int), protein (float), carbs (float), fat (float), and icon (a single relevant emoji). Return ONLY the JSON object with a 'foods' key containing the array."
          },
          {
            role: "user",
            content: `Search query: ${q}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`OpenRouter API error (${response.status}):`, errorBody);
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) return [];

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse LLM response:", content);
      return [];
    }

    const foods = parsed.foods || [];

    return foods.map(f => ({
      name: f.name || "Unknown",
      calories: Math.round(Number(f.calories) || 0),
      protein: Math.round((Number(f.protein) || 0) * 10) / 10,
      carbs: Math.round((Number(f.carbs) || 0) * 10) / 10,
      fat: Math.round((Number(f.fat) || 0) * 10) / 10,
      icon: f.icon || "🍽"
    }));

  } catch (err) {
    console.warn("Food search error:", err);
    return [];
  }
}
