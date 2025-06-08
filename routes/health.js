const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Test endpoint for debugging
router.get('/test-gemini', async (req, res) => {
  try {
    console.log('=== GEMINI API TEST ===');
    console.log('API Key configured:', !!process.env.GEMINI_API_KEY);
    console.log('API Key format valid:', process.env.GEMINI_API_KEY?.startsWith('AIza'));
    
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        status: 'error',
        message: 'No API key configured',
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

module.exports = router;