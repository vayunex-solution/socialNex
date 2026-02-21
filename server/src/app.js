/**
 * Express Application Setup
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const routes = require('./routes');
const { logger } = require('./utils/logger');

const app = express();

// ===========================================
// Security & CORS Middleware
// ===========================================
const allowedOrigins = [
    'http://localhost:5173',
    'https://socialnex.vayunexsolution.com',
    'http://socialnex.vayunexsolution.com'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL.replace(/\/$/, ''))) {
            callback(null, true);
        } else {
            // Log the blocked origin for debugging
            logger.warn(`CORS blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(helmet());


// ===========================================
// Request Parsing
// ===========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===========================================
// Logging
// ===========================================
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// ===========================================
// Static Files
// ===========================================
app.use('/uploads', express.static('uploads'));

// ===========================================
// API Documentation (Swagger)
// ===========================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0 }
  `,
    customSiteTitle: 'SocialNex API Documentation'
}));

// ===========================================
// Health Check
// ===========================================
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'SocialNex API is running!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// ===========================================
// API Routes
// ===========================================
app.use('/api/v1', routes);

// ===========================================
// Error Handling
// ===========================================
app.use(notFound);
app.use(errorHandler);

module.exports = app;
