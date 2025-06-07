const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

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
    'http://localhost:3002',
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Training data endpoint
app.get('/api/training-data', (req, res) => {
  const trainingData = process.env.REACT_APP_TRAINING_DATA || `
# CR8 Digital Creative Agency - AI Assistant Training Data

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

## Production Process
1. **Understanding Your Brand** – We exchange ideas to align with your vision
2. **Drafting Storyboard (24–48 hours)** – We prepare and finalize a storyboard; changes during production may incur fees
3. **Production (12–72 hours)** – Our team executes and reviews the project based on the approved storyboard
4. **Client Approval** – Feedback is collected through Frame.io, with support available
5. **Revision** – Revisions are made based on feedback. After 3 rounds, extra fees may apply

## Service Packages

### LOE 1 Package
- Basic Short Form Video (30s–1m)
- Basic Long Form Video (5m–10m)
- Basic Motion Graphic Elements (Lower Thirds)

### LOE 2 Package
- Short Form Video (30s–1m)
- Long Form Video (5m–20m)
- Motion Graphics (Lower Thirds, Intro Animation, Logo Animation)

### LOE 3 Package
- Advanced Video Editing with VFX
- Template Creation
- Full Motion Graphics (Lower Thirds, Intro Animation, Logo Animation)

### Custom Packages
Yes! You can choose any combination of services from our packages to create a customized solution based on your needs.

## Why Brands Trust CR8
- Uphold the highest quality standards
- Align projects with brand identity
- Stay current with industry trends

## Personality Guidelines
- Be enthusiastic about creative projects
- Highlight CR8's expertise and quality
- Always mention relevant services when appropriate
- Be professional yet creative in responses
- Encourage potential clients to reach out
`;

  res.json({ 
    data: trainingData,
    timestamp: new Date().toISOString()
  });
});

// Enhanced system prompt function
const getCR8SystemPrompt = () => `You are an AI assistant for CR8 Digital Creative Agency, a professional creative agency specializing in bringing clients' visions to life.

## About CR8
- **Mission**: Help clients unleash their creative vision through professional visual storytelling
- **Tagline**: "Let's Create & Unleash Your Creative Vision"
- **Specialties**: Graphic Design, Video Editing, Motion Graphics, Animation, Logo Animation

## Contact Information
- Primary Email: creativscr8@gmail.com
- Alternative Email: eldriv@proton.me  
- Portfolio: https://cr8-agency.netlify.app/#works

## Service Packages
**LOE 1 (Basic)**: Short Form Video (30s–1m), Long Form Video (5m–10m), Basic Motion Graphics
**LOE 2 (Standard)**: Short Form Video (30s–1m), Long Form Video (5m–20m), Motion Graphics with Intro Animation
**LOE 3 (Advanced)**: Advanced Video Editing with VFX, Template Creation, Full Motion Graphics

## Creative Process
1. Understanding Your Brand (discovery phase)
2. Drafting Storyboard (24–48 hours)
3. Production (12–72 hours) 
4. Client Approval
5. Revision (if needed)

## Your Role & Personality
- Be enthusiastic, creative, and professional
- Focus on understanding the client's creative vision
- Ask clarifying questions about projects
- Provide specific, actionable advice
- Reference CR8's capabilities naturally
- Be encouraging and supportive of creative endeavors
- Avoid being overly promotional - focus on being helpful

## Response Guidelines
- Keep responses conversational and engaging
- Ask follow-up questions to better understand projects
- Provide specific examples when relevant
- Reference the appropriate service level (LOE 1-3) when discussing projects
- Always maintain a creative, professional tone
- Vary your responses to avoid repetition

Please respond as the CR8 assistant, keeping your responses natural and helpful.`;

// Fallback response generator
const generateEnhancedCR8Response = (prompt) => {
  const lowerPrompt = prompt.toLowerCase();
  
  // Greeting responses
  if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey')) {
    return "Hello! Welcome to CR8 Digital Creative Agency! 🎨 I'm here to help you unleash your creative vision. Whether you're looking for video editing, motion graphics, animation, or logo design, we've got you covered. What creative project are you thinking about?";
  }
  
  // Services inquiry
  if (lowerPrompt.includes('service') || lowerPrompt.includes('what do you do') || lowerPrompt.includes('help')) {
    return "At CR8, we specialize in bringing your creative vision to life! Our services include:\n\n🎬 Video Editing (Short & Long Form)\n🎨 Motion Graphics & Animation\n✨ Logo Animation\n🎯 Graphic Design\n\nWe offer three service levels:\n• LOE 1: Basic projects (30s-1m videos, basic motion graphics)\n• LOE 2: Standard projects (up to 20m videos, intro animations)\n• LOE 3: Advanced projects (VFX, templates, full motion graphics)\n\nWhat type of project did you have in mind?";
  }
  
  // Pricing inquiry
  if (lowerPrompt.includes('price') || lowerPrompt.includes('cost') || lowerPrompt.includes('package')) {
    return "Great question! Our pricing varies based on the complexity and scope of your project. We offer three main service levels (LOE 1-3) and custom packages to fit your specific needs.\n\nTo give you the most accurate quote, I'd love to learn more about your project:\n• What type of video/graphics do you need?\n• How long should the final product be?\n• Do you need motion graphics or special effects?\n\nFeel free to email us at creativscr8@gmail.com for a detailed quote!";
  }
  
  // Contact inquiry
  if (lowerPrompt.includes('contact') || lowerPrompt.includes('email') || lowerPrompt.includes('reach')) {
    return "You can reach us at:\n📧 creativscr8@gmail.com (primary)\n📧 eldriv@proton.me (alternative)\n\n🌐 Check out our portfolio: https://cr8-agency.netlify.app/#works\n\nWe typically respond within 24 hours and would love to discuss your creative project!";
  }
  
  // Process inquiry
  if (lowerPrompt.includes('process') || lowerPrompt.includes('how do you work') || lowerPrompt.includes('workflow')) {
    return "Our creative process is designed to bring your vision to life efficiently:\n\n1. **Understanding Your Brand** - We dive deep into your vision and goals\n2. **Drafting Storyboard** (24-48 hours) - We create a visual roadmap\n3. **Production** (12-72 hours) - Our team works their magic\n4. **Client Approval** - We gather your feedback through Frame.io\n5. **Revision** - We perfect it based on your input\n\nThis process ensures we align with your brand and deliver exactly what you envision!";
  }
  
  // Default response
  return "Thanks for reaching out to CR8! 🎨 We're passionate about helping bring creative visions to life through video editing, motion graphics, and animation.\n\nI'd love to learn more about your project! Whether you need a short promotional video, logo animation, or complex motion graphics, we have the expertise to make it happen.\n\nWhat creative challenge can we help you solve today?";
};

// Main chat endpoint - Fixed version
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid prompt provided',
        details: 'Prompt must be a non-empty string'
      });
    }

    console.log('=== CHAT REQUEST DEBUG ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Prompt length:', prompt.length);
    console.log('Prompt preview:', prompt.substring(0, 200) + (prompt.length > 200 ? '...' : ''));
    console.log('Gemini API Key configured:', !!process.env.GEMINI_API_KEY);

    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
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

    // Validate API key format
    if (!process.env.GEMINI_API_KEY.startsWith('AIza')) {
      console.log('❌ Invalid Gemini API key format - should start with "AIza"');
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

    // Try Gemini API
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

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('✅ Gemini API response received');
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Gemini API Error Response:', errorText);
        
        let errorReason = 'api_error';
        if (response.status === 400) errorReason = 'bad_request';
        else if (response.status === 401) errorReason = 'invalid_api_key';
        else if (response.status === 403) errorReason = 'forbidden';
        else if (response.status === 429) errorReason = 'rate_limited';
        else if (response.status >= 500) errorReason = 'server_error';

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
          reason: errorReason,
          error: errorText
        });
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!aiResponse || !aiResponse.trim()) {
        console.log('❌ Empty or invalid response from Gemini API');
        
        if (data.candidates?.[0]?.finishReason === 'SAFETY') {
          console.log('Response blocked by safety filters');
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
            reason: 'safety_blocked'
          });
        }
        
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

      console.log('✅ Successful Gemini response received');
      console.log('Response length:', aiResponse.length);
      
      return res.json({
        candidates: [{
          content: {
            parts: [{
              text: aiResponse.trim()
            }]
          }
        }],
        source: 'gemini'
      });

    } catch (apiError) {
      console.log('❌ Gemini API Request Failed');
      console.log('Error message:', apiError.message);
      
      let errorReason = 'network_error';
      if (apiError.message.includes('timeout')) {
        errorReason = 'timeout';
      } else if (apiError.message.includes('ENOTFOUND')) {
        errorReason = 'network_error';
      }
      
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
        reason: errorReason,
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

// Test endpoint for debugging
app.get('/api/test-gemini', async (req, res) => {
  try {
    console.log('=== GEMINI API TEST ===');
    console.log('API Key configured:', !!process.env.GEMINI_API_KEY);
    console.log('API Key format valid:', process.env.GEMINI_API_KEY?.startsWith('AIza'));
    
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        status: 'error',
        message: 'No API key configured',
        solution: 'Add GEMINI_API_KEY to your .env file'
      });
    }

    const testPrompt = "Hello, this is a test message.";
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: testPrompt
          }]
        }]
      })
    });

    const responseText = await response.text();
    
    res.json({
      status: response.ok ? 'success' : 'error',
      statusCode: response.status,
      response: response.ok ? JSON.parse(responseText) : responseText
    });

  } catch (error) {
    res.json({
      status: 'error',
      message: error.message,
      type: error.constructor.name
    });
  }
});

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
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`🧪 Test Gemini: http://localhost:${PORT}/api/test-gemini`);
  console.log(`📚 Training data: http://localhost:${PORT}/api/training-data`);
  
  // Log environment info
  console.log('\n📋 Environment:');
  console.log(`- Node.js: ${process.version}`);
  console.log(`- Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`- Port: ${PORT}`);
  console.log(`- Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`- Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}`);
  console.log(`- Allowed Origins: ${process.env.ALLOWED_ORIGINS || 'Not set'}`);
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