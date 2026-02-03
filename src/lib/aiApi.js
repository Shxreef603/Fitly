const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Convert file to base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Scan meal from image
 * @param {File|string} image - File object or base64 string
 * @param {Object} userGoals - User's daily macro goals
 * @returns {Promise<Object>} Nutrition analysis results
 */
export const scanMeal = async (image, userGoals = null) => {
  try {
    let base64Image = image;
    
    // Convert File to base64 if needed
    if (image instanceof File) {
      base64Image = await fileToBase64(image);
    }

    const response = await fetch(`${API_BASE_URL}/api/food-scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        userGoals
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to scan meal' }));
      throw new Error(error.error || error.message || 'Failed to scan meal');
    }

    return await response.json();
  } catch (error) {
    console.error('Scan meal error:', error);
    throw error;
  }
};

/**
 * Send chat message to AI
 * @param {string} message - User message
 * @param {Object} userGoals - User's daily macro goals
 * @param {File|string} image - Optional image
 * @param {Array} conversationHistory - Previous messages
 * @returns {Promise<Object>} AI response
 */
export const sendChatMessage = async (message, userGoals = null, image = null, conversationHistory = []) => {
  try {
    let base64Image = null;

    // Convert File to base64 if needed
    if (image instanceof File) {
      base64Image = await fileToBase64(image);
    } else if (typeof image === 'string') {
      base64Image = image;
    }

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userGoals,
        image: base64Image,
        conversationHistory
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to get AI response' }));
      throw new Error(error.error || error.message || 'Failed to get AI response');
    }

    return await response.json();
  } catch (error) {
    console.error('Chat error:', error);
    throw error;
  }
};

/**
 * Check if API server is reachable
 */
export const checkAPIHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
};
