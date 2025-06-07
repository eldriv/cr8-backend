// Fixed local-server.js - Aligned with config.js
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Initialize Express app
const app = express();

// FIXED: Port configuration to match config.js (10000, not 3002)
const PORT = process.env.PORT || 10000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

// CORS configuration - aligned with config.js expectations
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:10000', // ADDED: Match the server port
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

// FIXED: CR8 System Prompt - aligned with config.js PROMPT_TEMPLATE format
function getCR8SystemPrompt() {
  return `You are CR8, an AI assistant for a creative digital agency. You are helpful, creative, professional, and knowledgeable about marketing, branding, design, video editing, motion graphics, and business strategy.

About CR8:
- Digital creative agency specializing in graphic design, video editing, motion graphics, and animation
- Tagline: "Let's Create & Unleash Your Creative Vision"
- Contact: creativscr8@gmail.com, eldriv@proton.me
- Portfolio: https://cr8-agency.netlify.app/#works

Services:
- Graphic Design
- Video Editing  
- Motion Graphics
- Animation
- Logo Animation

Service Packages:
- LOE 1: Basic Short Form Video (30s–1m), Basic Long Form Video (5m–10m), Basic Motion Graphics
- LOE 2: Standard Short Form Video (30s–1m), Long Form Video (5m–20m), Motion Graphics with Intro Animation
- LOE 3: Advanced Video Editing with VFX, Template Creation, Full Motion Graphics

Production Process:
1. Understanding Your Brand
2. Drafting Storyboard (24–48 hours)
3. Production (12–72 hours)
4. Client Approval
5. Revision

Respond in a friendly, professional, and creative manner while staying true to CR8's brand and services.`;
}

// FIXED: Training data content - exactly matching config.js DEFAULT_TRAINING_DATA
const CR8_TRAINING_DATA = `# CR8 Digital Creative Agency - Training Data

## About CR8
CR8 is a digital creative agency that helps clients bring their creative vision to life through graphic design, video editing, animation, and motion graphics.

**Tagline**: Let's Create & Unleash Your Creative Vision.

## Contact Information
- Email: creativscr8@gmail.com
- Alternative Email: eldriv@proton.me
- Portfolio: https://cr8-agency.netlify.app/#works

## Services Offered
- Graphic Design
- Video Editing
- Motion Graphics
- Animation
- Logo Animation

## Target Audience
We serve clients who need visual storytelling and branding services. Our goal is to bring your vision to life with creative execution.

## Service Packages
### LOE 1: Basic Short Form Video (30s–1m), Basic Long Form Video (5m–10m), Basic Motion Graphic Elements
### LOE 2: Short Form Video (30s–1m), Long Form Video (5m–20m), Motion Graphics with Intro Animation
### LOE 3: Advanced Video Editing with VFX, Template Creation, Full Motion Graphics

## Why Brands Trust CR8
- Uphold the highest quality standards
- Align projects with brand identity
- Stay current with industry trends

## Production Process
1. Understanding Your Brand
2. Drafting Storyboard (24–48 hours)
3. Production (12–72 hours)
4. Client Approval
5. Revision

## Creative Expertise
- Brand Identity Design
- Social Media Content
- Video Production
- Motion Graphics
- Animation Services
- Visual Storytelling
`;

// Enhanced fallback response generator - aligned with config.js messaging
function generateEnhancedCR8Response(prompt) {
  const responses = {
    greeting: [
      "Hello! I'm CR8, your creative agency assistant. How can I help you unleash your creative vision today?",
      "Hi there! Welcome to CR8. I'm here to help you with all things creative and strategic. What can I assist you with?",
      "Hey! CR8 here, ready to help you create something amazing. What's on your mind?"
    ],
    services: [
      "Great question about our services! CR8 specializes in graphic design, video editing, motion graphics, and animation. Which service interests you most?",
      "We offer comprehensive creative services including video production, motion graphics, and brand design. What project are you working on?",
      "Our creative expertise spans from logo animation to full video production. How can we bring your vision to life?"
    ],
    pricing: [
      "We have three main service packages: LOE 1 for basic projects, LOE 2 for standard work with intro animations, and LOE 3 for advanced editing with VFX. What type of project are you considering?",
      "Our packages range from basic short-form videos to advanced motion graphics with VFX. The timeline varies from 24-72 hours depending on complexity. What's your project scope?",
      "Pricing depends on the level of complexity and services needed. We offer tiered packages to match different project requirements. Would you like details on a specific service?"
    ],
    contact: [
      "You can reach CR8 at creativscr8@gmail.com or eldriv@proton.me. You can also check out our portfolio at https://cr8-agency.netlify.app/#works",
      "Feel free to contact us directly! Our main email is creativscr8@gmail.com, and you can see our work at https://cr8-agency.netlify.app/#works",
      "Get in touch with us at creativscr8@gmail.com or eldriv@proton.me. Our portfolio showcases our latest work at https://cr8-agency.netlify.app/#works"
    ],
    default: [
      "That's an interesting question! As your CR8 assistant, here's what I think based on our creative expertise...",
      "Let me help you with that from a creative agency perspective, focusing on how we can bring your vision to life...",
      "Great question! Here's my professional take based on CR8's experience in creative projects..."
    ]
  };

  const lowerPrompt = prompt.toLowerCase();
  let responseArray = responses.default;

  if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey')) {
    responseArray = responses.greeting;
  } else if (lowerPrompt.includes('service') || lowerPrompt.includes('what do') || lowerPrompt.includes('offer')) {
    responseArray = responses.services;
  } else if (lowerPrompt.includes('price') || lowerPrompt.includes('cost') || lowerPrompt.includes('package') || lowerPrompt.includes('loe')) {
    responseArray = responses.pricing;
  } else if (lowerPrompt.includes('contact') || lowerPrompt.includes('email') || lowerPrompt.includes('portfolio') || lowerPrompt.includes('reach')) {
    responseArray = responses.contact;
  }

  const randomResponse = responseArray[Math.floor(Math.random() * responseArray.length)];
  
  return `${randomResponse}

While I'm currently running on backup systems, I'm still here to provide creative insights and strategic guidance. Feel free to ask me about our services, packages, creative process, or any other agency-related topics!

Is there a specific creative project or challenge you'd like to discuss?`;
}

// Root endpoint - aligned with config.js endpoint structure
app.get('/', (req, res) => {
  res.json({ 
    message: 'CR8 Backend API is running',
    status: 'ok',
    app: 'CR8 AI Assistant',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      chat: '/api/chat',
      trainingData: '/api/training-data',
      debug: '/api/debug'
    },
    timestamp: new Date().toISOString()
  });
});

// FIXED: Health check endpoint - matching config.js expectations
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// FIXED: Training data endpoint - return JSON format as expected by config.js
app.get('/api/training-data', (req, res) => {
  console.log('📚 Training data requested');
  
  // FIXED: Return JSON format with 'content' property as expected by config.js
  res.json({
    content: CR8_TRAINING_DATA,
    source: 'server',
    timestamp: new Date().toISOString(),
    length: CR8_TRAINING_DATA.length
  });
});

// FIXED: Chat endpoint - properly aligned with config.js expectations
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
      // FIXED: Return format exactly as expected by config.js
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
      // FIXED: Format prompt exactly like config.js PROMPT_TEMPLATE expects
      const fullPrompt = `${systemPrompt}

User: ${prompt}
CR8 Assistant:`;
      
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

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
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
      
      // FIXED: Return exact format expected by config.js
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

// FIXED: Debug endpoint - aligned with config.js expectations
app.get('/api/debug', (req, res) => {
  res.json({
    app: 'CR8 AI Assistant',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    geminiKeyFormat: process.env.GEMINI_API_KEY ? 
      (process.env.GEMINI_API_KEY.startsWith('AIza') ? 'valid' : 'invalid') : 'missing',
    cors: corsOptions.origin,
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    endpoints: [
      'GET /',
      'GET /api/health',
      'POST /api/chat',
      'GET /api/training-data',
      'GET /api/debug'
    ]
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
  console.log(`🔗 Available at: http://localhost:${PORT}`);
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