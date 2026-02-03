import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import foodScanRouter from './routes/foodScan.js';
import chatRouter from './routes/chat.js';
import foodSearchRouter from './routes/foodSearch.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Debug: Check if API key is loaded
console.log('🔑 API Key loaded:', process.env.OPENROUTER_API_KEY ? '✅ Yes (length: ' + process.env.OPENROUTER_API_KEY.length + ')' : '❌ No');

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Support base64 images
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api', foodScanRouter);
app.use('/api', chatRouter);
app.use('/api', foodSearchRouter);

// Root route - Welcome message
app.get('/', (req, res) => {
    res.json({
        message: '🚀 Fitly API Server is running!',
        version: '1.0.0',
        endpoints: {
            'POST /api/food-scan': 'AI meal analysis from image',
            'POST /api/chat': 'AI nutrition assistant chat',
            'GET /health': 'Health check'
        },
        status: 'ok',
        apiKeyConfigured: !!process.env.OPENROUTER_API_KEY
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Fitly API Server is running',
        apiKeyConfigured: !!process.env.OPENROUTER_API_KEY
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Fitly API Server running on http://localhost:${PORT}`);
    console.log(`📡 Ready to handle AI requests`);
});
