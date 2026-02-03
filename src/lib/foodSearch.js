const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * @param {string} query
 * @param {{ limit?: number }} opts
 * @returns {Promise<Array<{ name: string, calories: number, protein: number, carbs: number, fat: number, icon: string }>>}
 */
export async function searchFoods(query, opts = {}) {
  const q = (query || "").trim();
  if (!q) return [];

  try {
    const response = await fetch(`${API_BASE_URL}/api/food-search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: q,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to search for foods' }));
      console.error('Food search error:', error);
      return [];
    }

    return await response.json();
  } catch (err) {
    console.warn("Food search error:", err);
    return [];
  }
}
