const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002; // Updated to match your deployment

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

// CORS configuration - Updated to fix CORS issues
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'https://cr8-agency.netlify.app', // Your actual frontend URL
    'https://your-netlify-app.netlify.app', // Replace with your actual Netlify URL
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Training data endpoint - Updated with CR8 specific data
app.get('/api/training-data', (req, res) => {
  const trainingData = `
# CR8 Digital Creative Agency - Training Data

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

## Personality Guidelines
- Be friendly, creative, and professional
- Provide clear and engaging answers
- Focus on visual storytelling and creative solutions
- Ask clarifying questions when needed
- Be encouraging and supportive of creative endeavors
`;

  res.json({ 
    data: trainingData,
    timestamp: new Date().toISOString()
  });
});

// Main chat endpoint - Using Gemini API
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid prompt provided',
        details: 'Prompt must be a non-empty string'
      });
    }

    // Log the incoming request
    console.log('Chat request received:', {
      timestamp: new Date().toISOString(),
      promptLength: prompt.length,
      ip: req.ip
    });

    // Use Gemini API
    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a helpful AI assistant for CR8 Digital Creative Agency. CR8 specializes in graphic design, video editing, animation, and motion graphics. Our tagline is "Let's Create & Unleash Your Creative Vision."

Key services:
- Graphic Design
- Video Editing  
- Motion Graphics
- Animation
- Logo Animation

Contact: creativscr8@gmail.com
Portfolio: https://cr8-agency.netlify.app/#works

Be friendly, creative, and professional. Focus on visual storytelling and creative solutions.

User message: ${prompt}`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here to help with your creative needs! How can CR8 assist you today?";
          
          return res.json({
            candidates: [{
              content: {
                parts: [{
                  text: aiResponse
                }]
              }
            }]
          });
        } else {
          const errorData = await response.text();
          console.error('Gemini API error:', response.status, errorData);
        }
      } catch (error) {
        console.error('Gemini API error:', error);
      }
    }

    // Fallback: Rule-based responses with CR8 context
    const fallbackResponse = generateCR8FallbackResponse(prompt);
    res.json({
      candidates: [{
        content: {
          parts: [{
            text: fallbackResponse
          }]
        }
      }]
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Something went wrong processing your request'
    });
  }
});

// CR8-specific fallback response generator
function generateCR8FallbackResponse(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Greeting responses
  if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey')) {
    return "Hello! Welcome to CR8 Digital Creative Agency. I'm here to help you unleash your creative vision! How can I assist you with your creative projects today?";
  }
  
  // Services related
  if (lowerPrompt.includes('service') || lowerPrompt.includes('what do you do')) {
    return "CR8 offers a full range of creative services including Graphic Design, Video Editing, Motion Graphics, Animation, and Logo Animation. We help bring your creative vision to life! Which service interests you?";
  }
  
  // Pricing/packages
  if (lowerPrompt.includes('price') || lowerPrompt.includes('cost') || lowerPrompt.includes('package')) {
    return "We offer three main service levels: LOE 1 (Basic), LOE 2 (Standard), and LOE 3 (Advanced). Each package is tailored to different project needs and budgets. Would you like me to explain the details of each package?";
  }
  
  // Contact related
  if (lowerPrompt.includes('contact') || lowerPrompt.includes('email') || lowerPrompt.includes('reach')) {
    return "You can reach CR8 at creativscr8@gmail.com or check out our portfolio at https://cr8-agency.netlify.app/#works. We'd love to hear about your creative project!";
  }
  
  // Portfolio/work
  if (lowerPrompt.includes('portfolio') || lowerPrompt.includes('work') || lowerPrompt.includes('example')) {
    return "Check out our creative work at https://cr8-agency.netlify.app/#works! We've worked on various projects including video editing, motion graphics, and brand animations. What type of creative work are you interested in?";
  }
  
  // Process related
  if (lowerPrompt.includes('process') || lowerPrompt.includes('how') || lowerPrompt.includes('work')) {
    return "Our creative process includes: 1) Understanding Your Brand, 2) Drafting Storyboard (24-48 hours), 3) Production (12-72 hours), 4) Client Approval, 5) Revision. We ensure your vision comes to life perfectly!";
  }
  
  // Video editing
  if (lowerPrompt.includes('video') || lowerPrompt.includes('edit')) {
    return "CR8 specializes in both short-form (30s-1m) and long-form (5m-20m) video editing. We offer everything from basic editing to advanced VFX and template creation. What kind of video project do you have in mind?";
  }
  
  // Motion graphics/animation
  if (lowerPrompt.includes('motion') || lowerPrompt.includes('animation') || lowerPrompt.includes('graphic')) {
    return "We create stunning motion graphics and animations that bring brands to life! From basic motion elements to full intro animations and logo animations. What's your creative vision?";
  }
  
  // Default creative response
  const defaultResponses = [
    "That's an exciting creative challenge! At CR8, we love bringing unique visions to life. Could you tell me more about your project?",
    "I'd love to help you with that! CR8 specializes in turning creative ideas into reality. What specific aspect would you like to explore?",
    "Great question! As your CR8 creative assistant, I'm here to help unleash your creative potential. Can you provide more details?",
    "Let's create something amazing together! What creative project or question can I help you with?",
    "CR8 is all about bringing your vision to life! Could you elaborate on what you're looking to create?"
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`📚 Training data: http://localhost:${PORT}/api/training-data`);
  console.log(' ');
  
  // Log environment info
  console.log('📋 Environment:');
  console.log(`- Node.js: ${process.version}`);
  console.log(`- Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`- OpenAI API: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`- Hugging Face API: ${process.env.HUGGINGFACE_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`- Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 Received SIGINT, shutting down gracefully');
  process.exit(0);
});