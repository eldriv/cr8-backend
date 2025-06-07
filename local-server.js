// Updated backend configuration fixes

// 1. Fix PORT configuration in your backend
const PORT = process.env.PORT || 10000; // Render typically uses port 10000

// 2. Update CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'https://cr8-agency.netlify.app',
    'https://cr8-backend.onrender.com', // Add your own backend URL
    process.env.FRONTEND_URL,
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
};

// 3. Add root endpoint to handle base URL requests
app.get('/', (req, res) => {
  res.json({ 
    message: 'CR8 Backend API is running',
    status: 'ok',
    endpoints: {
      health: '/api/health',
      chat: '/api/chat',
      trainingData: '/api/training-data',
      testGemini: '/api/test-gemini'
    },
    timestamp: new Date().toISOString()
  });
});

// 4. Fix the chat endpoint error handling
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
        body: JSON.stringify(requestBody),
        timeout: 30000 // 30 second timeout
      });

      console.log('Gemini API response status:', response.status);
      console.log('Gemini API response headers:', Object.fromEntries(response.headers.entries()));

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
        candidatesLength: data.candidates?.length || 0,
        firstCandidate: data.candidates?.[0] ? Object.keys(data.candidates[0]) : null
      });

      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!aiResponse || !aiResponse.trim()) {
        console.log('❌ Empty response from Gemini API');
        console.log('Full response data:', JSON.stringify(data, null, 2));
        
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
          reason: 'empty_response',
          debug: data
        });
      }

      console.log('✅ Successful Gemini response');
      console.log('Response preview:', aiResponse.substring(0, 100) + '...');
      
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
        message: apiError.message,
        stack: apiError.stack?.split('\n')[0]
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

// 5. Add debugging endpoint to check environment
app.get('/api/debug', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
    port: PORT,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    geminiKeyFormat: process.env.GEMINI_API_KEY ? 
      (process.env.GEMINI_API_KEY.startsWith('AIza') ? 'valid' : 'invalid') : 'missing',
    cors: corsOptions.origin,
    timestamp: new Date().toISOString()
  });
});

// 6. Better error logging
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