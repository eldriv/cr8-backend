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
    'http://localhost:3000',
    'http://localhost:3001',
    'https://your-netlify-app.netlify.app', // Replace with your actual Netlify URL
    process.env.FRONTEND_URL
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
  const trainingData = `
# Chatbot Training Data

## About This Assistant
You are a helpful AI assistant designed to provide friendly, informative, and engaging conversations. You have access to general knowledge and can help with various topics including:

- General questions and information
- Programming and technical help
- Creative writing and brainstorming
- Problem-solving assistance
- Casual conversation

## Personality Guidelines
- Be friendly, helpful, and professional
- Provide clear and concise answers
- Ask clarifying questions when needed
- Admit when you don't know something
- Be encouraging and supportive

## Response Guidelines
- Keep responses conversational and engaging
- Use examples when helpful
- Break down complex topics into simpler parts
- Offer follow-up suggestions when appropriate
- Maintain a positive and helpful tone

## Conversation Starters
- "Hello! How can I help you today?"
- "I'm here to assist with any questions you might have."
- "What would you like to know or discuss?"
`;

  res.json({ 
    data: trainingData,
    timestamp: new Date().toISOString()
  });
});

// Main chat endpoint - Using Hugging Face as example
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

    // Option 1: Use Hugging Face Inference API (Free tier available)
    if (process.env.HUGGINGFACE_API_KEY) {
      try {
        const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_length: 500,
              temperature: 0.7,
              do_sample: true,
              top_p: 0.9
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const aiResponse = data.generated_text || data[0]?.generated_text || "I'm here to help! Could you please rephrase your question?";
          
          return res.json({
            candidates: [{
              content: {
                parts: [{
                  text: aiResponse.replace(prompt, '').trim() || "I'm ready to assist you with any questions!"
                }]
              }
            }]
          });
        }
      } catch (error) {
        console.error('Hugging Face API error:', error);
      }
    }

    // Option 2: Use OpenAI API (if available)
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful, friendly AI assistant. Provide clear, concise, and helpful responses.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 500,
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json();
          const aiResponse = data.choices?.[0]?.message?.content || "I'm here to help! How can I assist you?";
          
          return res.json({
            candidates: [{
              content: {
                parts: [{
                  text: aiResponse
                }]
              }
            }]
          });
        }
      } catch (error) {
        console.error('OpenAI API error:', error);
      }
    }

    // Fallback: Rule-based responses
    const fallbackResponse = generateFallbackResponse(prompt);
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

// Fallback response generator
function generateFallbackResponse(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Greeting responses
  if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey')) {
    return "Hello! I'm your AI assistant. How can I help you today?";
  }
  
  // How are you responses
  if (lowerPrompt.includes('how are you')) {
    return "I'm doing well, thank you for asking! I'm here and ready to help you with any questions or tasks you might have.";
  }
  
  // Help responses
  if (lowerPrompt.includes('help')) {
    return "I'm here to help! I can assist you with various tasks like answering questions, providing information, helping with problem-solving, or just having a friendly conversation. What would you like to know?";
  }
  
  // Programming related
  if (lowerPrompt.includes('code') || lowerPrompt.includes('programming') || lowerPrompt.includes('javascript') || lowerPrompt.includes('python')) {
    return "I'd be happy to help you with programming! Whether you need help with debugging, learning new concepts, or code reviews, I'm here to assist. What specific programming question do you have?";
  }
  
  // Weather (since we can't access real weather data)
  if (lowerPrompt.includes('weather')) {
    return "I don't have access to real-time weather data, but I'd recommend checking a reliable weather service like Weather.com or your local weather app for accurate, up-to-date information.";
  }
  
  // Time related
  if (lowerPrompt.includes('time') || lowerPrompt.includes('date')) {
    return `The current server time is ${new Date().toLocaleString()}. Is there something specific about time or dates you'd like to know?`;
  }
  
  // Goodbye responses
  if (lowerPrompt.includes('bye') || lowerPrompt.includes('goodbye') || lowerPrompt.includes('see you')) {
    return "Goodbye! It was nice chatting with you. Feel free to come back anytime if you have more questions!";
  }
  
  // Thank you responses
  if (lowerPrompt.includes('thank')) {
    return "You're welcome! I'm glad I could help. Is there anything else you'd like to know?";
  }
  
  // Default response
  const defaultResponses = [
    "That's an interesting question! Could you provide a bit more context so I can give you a more helpful response?",
    "I'd be happy to help you with that! Can you tell me a bit more about what you're looking for?",
    "Thanks for your message! I'm here to assist you. Could you elaborate on what you'd like to know?",
    "I'm ready to help! Could you provide some more details about your question?",
    "That's a great topic to discuss! What specific aspect would you like to explore?"
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
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`📚 Training data: http://localhost:${PORT}/api/training-data`);
  
  // Log environment info
  console.log('\n📋 Environment:');
  console.log(`- Node.js: ${process.version}`);
  console.log(`- Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`- OpenAI API: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`- Hugging Face API: ${process.env.HUGGINGFACE_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
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