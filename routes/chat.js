const express = require('express');
const fetch = require('node-fetch');
const { getCR8SystemPrompt, generateEnhancedCR8Response } = require('../utils/utilities.js');
const router = express.Router();

router.post('/chat', async (req, res) => {
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

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
      
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

module.exports = router;