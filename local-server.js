// Complete backend server configuration
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Initialize Express app
const app = express();

// Port configuration for Render
const PORT = process.env.PORT || 10000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'https://cr8-agency.netlify.app',
    'https://cr8-backend.onrender.com',
    process.env.FRONTEND_URL,
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// CR8 System Prompt Function
function getCR8SystemPrompt() {
  return `You are CR8, an AI assistant for a creative agency. You are helpful, creative, professional, and knowledgeable about marketing, branding, design, and business strategy. You provide actionable insights and creative solutions while maintaining a friendly, approachable tone.

Key traits:
- Creative and innovative thinking
- Professional yet approachable
- Marketing and branding expertise
- Solution-oriented responses
- Clear, actionable advice`;
}

// Enhanced fallback response generator
function generateEnhancedCR8Response(prompt) {
  const responses = {
    greeting: [
      "Hello! I'm CR8, your creative agency assistant. How can I help you with your marketing, branding, or creative projects today?",
      "Hi there! Welcome to CR8. I'm here to help you with all things creative and strategic. What can I assist you with?",
      "Hey! CR8 here, ready to help you create something amazing. What's on your mind?"
    ],
    marketing: [
      "Great marketing question! Let me share some strategic insights that could help elevate your approach...",
      "Marketing is all about connecting with your audience. Here's what I'd recommend...",
      "That's an excellent marketing challenge. Let's break it down strategically..."
    ],
    branding: [
      "Branding is at the heart of what we do at CR8. Here's my take on your question...",
      "Strong branding creates lasting connections. Let me help you think through this...",
      "Your brand identity is crucial. Here's how I'd approach this..."
    ],
    default: [
      "That's an interesting question! As your CR8 assistant, here's what I think...",
      "Let me help you with that from a creative agency perspective...",
      "Great question! Here's my professional take on this..."
    ]
  };

  const lowerPrompt = prompt.toLowerCase();
  let responseArray = responses.default;

  if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey')) {
    responseArray = responses.greeting;
  } else if (lowerPrompt.includes('marketing') || lowerPrompt.includes('campaign') || lowerPrompt.includes('advertising')) {
    responseArray = responses.marketing;
  } else if (lowerPrompt.includes('brand') || lowerPrompt.includes('logo') || lowerPrompt.includes('identity')) {
    responseArray = responses.branding;
  }

  const randomResponse = responseArray[Math.floor(Math.random() * responseArray.length)];
  
  return `${randomResponse}

While I'm currently running on backup systems, I'm still here to provide creative insights and strategic guidance. Feel free to ask me about marketing strategies, brand development, creative campaigns, or any other agency-related topics!

Is there a specific project or challenge you'd like to discuss?`;
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'CR8 Backend API is running',
    status: 'ok',
    endpoints: {
      health: '/api/health',
      chat: '/api/chat',
      trainingData: '/api/training-data',
      testGemini: '/api/test-gemini',
      debug: '/api/debug'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

// Chat endpoint with comprehensive error handling
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    console.log('=== CHAT REQUEST DEBUG ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Prompt received:', !!prompt);
    console.log('Prompt length:', prompt?.length || 0);
    console.log('Request body keys:', Object.keys(req.body));
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid prompt provided',
        details: 'Prompt must be a non-empty string',
        received: { prompt: typeof prompt, body: Object.keys(req.body) }
      });
    }

    // Check if Gemini API key exists and is valid
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API Key check:', {
      exists: !!apiKey,
      format: apiKey ? apiKey.substring(0, 10) + '...' : 'none',
      startsWithAIza: apiKey ? apiKey.startsWith('AIza') : false
    });

    if (!apiKey) {
      console.log('❌ No Gemini API key found - using fallback');
      const fallbackResponse = generateEnhancedCR8Response(prompt);
      return res.json({
        candidates: [{
          content: {
            parts: [{
              text: fallbackResponse
            }]
          }
        }],
        source: 'fallback',
        reason: 'no_api_key'
      });
    }

    if (!apiKey.startsWith('AIza')) {
      console.log('❌ Invalid Gemini API key format');
      const fallbackResponse = generateEnhancedCR8Response(prompt);
      return res.json({
        candidates: [{
          content: {
            parts: [{
              text: fallbackResponse
            }]
          }
        }],
        source: 'fallback',
        reason: 'invalid_api_key_format'
      });
    }

    // Try Gemini API with better error handling
    try {
      console.log('🔄 Attempting Gemini API call...');
      
      const systemPrompt = getCR8SystemPrompt();
      const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}\n\nCR8 Assistant:`;
      
      const requestBody = {
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
          stopSequences: ["User:", "Human:"]
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
      
      console.log('Making request to Gemini API...');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Gemini API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Gemini API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        const fallbackResponse = generateEnhancedCR8Response(prompt);
        return res.json({
          candidates: [{
            content: {
              parts: [{
                text: fallbackResponse
              }]
            }
          }],
          source: 'fallback',
          reason: 'api_error',
          error: {
            status: response.status,
            message: errorText
          }
        });
      }

      const data = await response.json();
      console.log('Gemini API response structure:', {
        hasCandidates: !!data.candidates,
        candidatesLength: data.candidates?.length || 0
      });

      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!aiResponse || !aiResponse.trim()) {
        console.log('❌ Empty response from Gemini API');
        
        const fallbackResponse = generateEnhancedCR8Response(prompt);
        return res.json({
          candidates: [{
            content: {
              parts: [{
                text: fallbackResponse
              }]
            }
          }],
          source: 'fallback',
          reason: 'empty_response'
        });
      }

      console.log('✅ Successful Gemini response');
      
      return res.json({
        candidates: [{
          content: {
            parts: [{
              text: aiResponse.trim()
            }]
          }
        }],
        source: 'gemini',
        success: true
      });

    } catch (apiError) {
      console.log('❌ Gemini API Request Failed');
      console.log('Error details:', {
        name: apiError.name,
        message: apiError.message
      });
      
      const fallbackResponse = generateEnhancedCR8Response(prompt);
      return res.json({
        candidates: [{
          content: {
            parts: [{
              text: fallbackResponse
            }]
          }
        }],
        source: 'fallback',
        reason: 'network_error',
        error: apiError.message
      });
    }

  } catch (error) {
    console.log('❌ CRITICAL ERROR in chat endpoint');
    console.log('Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Something went wrong processing your request',
      details: error.message
    });
  }
});

// Test Gemini endpoint
app.get('/api/test-gemini', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.json({
      status: 'no_api_key',
      message: 'No Gemini API key configured'
    });
  }

  try {
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(testUrl);
    
    if (response.ok) {
      res.json({
        status: 'success',
        message: 'Gemini API key is working'
      });
    } else {
      res.json({
        status: 'error',
        message: 'Gemini API key is invalid',
        statusCode: response.status
      });
    }
  } catch (error) {
    res.json({
      status: 'error',
      message: 'Failed to test Gemini API',
      error: error.message
    });
  }
});

// Training data endpoint
app.get('/api/training-data', (req, res) => {
  res.json({
    message: 'Training data endpoint',
    status: 'available',
    description: 'This endpoint can be used to manage training data for the CR8 assistant'
  });
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    geminiKeyFormat: process.env.GEMINI_API_KEY ? 
      (process.env.GEMINI_API_KEY.startsWith('AIza') ? 'valid' : 'invalid') : 'missing',
    cors: corsOptions.origin,
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'POST /api/chat',
      'GET /api/test-gemini',
      'GET /api/training-data',
      'GET /api/debug'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('=== UNHANDLED ERROR ===');
  console.error('URL:', req.url);
  console.error('Method:', req.method);
  console.error('Error:', error);
  console.error('Stack:', error.stack);
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'Something went wrong',
    url: req.url,
    method: req.method
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CR8 Backend Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 Gemini API: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`🌐 CORS Origins:`, corsOptions.origin);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});