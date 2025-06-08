const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const chatRoutes = require('./routes/chat');
const healthRoutes = require('./routes/health');
const trainingRoutes = require('./routes/training');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: [
    'https://cr8-agency.netlify.app',
    process.env.FRONTEND_URL,
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api', healthRoutes);
app.use('/api', trainingRoutes);
app.use('/api', chatRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: 'The requested endpoint was not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = isProduction 
    ? 'https://cr8-backend.onrender.com' 
    : `http://localhost:${PORT}`;
  const endpoints = [ 'Health check: /api/health', 'Chat endpoint: /api/chat',  'Test Gemini: /api/test-gemini',  'Training data: /api/training-data' ];

  for (const endpoint of endpoints) {
    console.log(`${endpoint.replace(':', `: ${baseUrl}`)}`);
  }
  console.log('\nEnvironment:');
  // Variables
  const envVars = [
    ['Node.js', process.version],
    ['Environment', process.env.NODE_ENV || 'development'],
    ['Port', PORT],
    ['Base URL', baseUrl],
    ['Gemini API', process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured'],
    ['Frontend URL', process.env.FRONTEND_URL || 'Not set'],
    ['Allowed Origins', process.env.ALLOWED_ORIGINS || 'Not set']
  ];
  for (const [label, value] of envVars) {
    console.log(`- ${label}: ${value}`);
  }
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});