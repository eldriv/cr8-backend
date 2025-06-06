
export const CONFIG = {
  API: {
    getApiBase: () => {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // Localhost development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return 'http://localhost:3002';
        }
        return 'https://cr8-backend.onrender.com';  
      }
      return process.env.NODE_ENV === 'production'
        ? 'https://cr8-backend.onrender.com'  
        : 'http://localhost:3002';
    },

    getEndpoints: (apiBase) => ({
      BACKEND_PROXY: ${apiBase}/api/gemini,
      HEALTH_CHECK: ${apiBase}/api/health,
      TRAINING_DATA: ${apiBase}/api/training-data
    })
  },

  TRAINING_DATA_PATHS: [
    '/api/training-data',
    '/data/training.txt',
    '/training.txt'
  ],

  DEFAULT_TRAINING_DATA: CR8 - Digital Solutions Company

CR8 is a digital creative agency that helps clients bring their creative vision to life through graphic design, video editing, animation, and motion graphics.
What's the tagline of CR8?
Let's Create & Unleash Your Creative Vision.
How can I contact CR8?
You can reach us via email at creativscr8@gmail.com or eldriv@proton.me
Where can I view CR8's portfolio?
You can view our portfolio here: https://cr8-nine.vercel.app/#works
What services does CR8 offer?
We offer the following creative services:
- Graphic Design
- Video Editing
- Motion Graphics
- Animation
- Logo Animation
Who does CR8 serve?
We serve clients who need visual storytelling and branding services. Our goal is to bring your vision to life with creative execution.
What is CR8's production process?
Our production process includes:
1. Understanding Your Brand – We exchange ideas to align with your vision.
2. Drafting Storyboard (24–48 hours) – We prepare and finalize a storyboard; changes during production may incur fees.
3. Production (12–72 hours) – Our team executes and reviews the project based on the approved storyboard.
4. Client Approval – Feedback is collected through Frame.io, with support available.
5. Revision – Revisions are made based on feedback. After 3 rounds, extra fees may apply.
What's included in the LOE 1 package?
LOE 1 includes:
- Basic Short Form Video (30s–1m)
- Basic Long Form Video (5m–10m)
- Basic Motion Graphic Elements (Lower Thirds)
What's included in the LOE 2 package?
LOE 2 includes:
- Short Form Video (30s–1m)
- Long Form Video (5m–20m)
- Motion Graphics (Lower Thirds, Intro Animation, Logo Animation)
What's included in the LOE 3 package?
LOE 3 includes:
- Advanced Video Editing with VFX
- Template Creation
- Full Motion Graphics (Lower Thirds, Intro Animation, Logo Animation)
Can I customize a package?
Yes! You can choose any combination of services from our packages to create a customized solution based on your needs.
Why do brands trust CR8?
Brands trust CR8 because we:
- Uphold the highest quality standards
- Align projects with brand identity
- Stay current with industry trends,

  UI: {
    DESKTOP: {
      CHAT_WIDTH: 'chat-window-desktop',
      CHAT_HEIGHT: 'chat-window-desktop', 
      MINIMIZED_HEIGHT: 'minimized',
      MINIMIZED_WIDTH: 'minimized'
    },
    
    MOBILE: {
      SAFE_AREA_TOP: 'safe-area-top',
      SAFE_AREA_BOTTOM: 'safe-area-bottom'
    },

    ANIMATIONS: {
      TYPING_DELAY: {
        BASE: 50,
        RANDOM: 50
      },
      BOUNCE_DELAYS: ['0.1s', '0.2s', '0.3s']
    },

    FIXED_DIMENSIONS: {
      DESKTOP: {
        WIDTH: '384px',
        HEIGHT: '600px',
        MINIMIZED_HEIGHT: '56px'
      }
    }
  },

  MESSAGES: {
    DEFAULT_ERROR: 'Sorry, I encountered an error. ',
    CONNECTION_ERROR: 'Cannot connect to the backend server.',
    RETRY_MESSAGE: 'Please try again.',
    NO_RESPONSE: 'Sorry, I could not generate a response.',
    NO_TRAINING_DATA: 'Using general knowledge mode - specific CR8 data not available.',
    
    PLACEHOLDERS: {
      DESKTOP: 'Ask about CR8 or any questions...',
      MOBILE: 'Type your message...'
    },

    WELCOME: {
      TITLE: 'CR8 Assistant',
      SUBTITLE_LOADED: "I can help with CR8 information and general questions.",
      SUBTITLE_LOADING: "I can answer general questions while CR8 data loads.",
      MOBILE_SUBTITLE: "I'm here to help you with any questions."
    }
  },

  SUGGESTIONS: {
    CR8_SPECIFIC: [
      "What is CR8?",
      "What services does CR8 offer?",
      "Tell me about CR8's portfolio"
    ],
    
    GENERAL: [],

    MOBILE_SPECIFIC: [
      "What is CR8?",
      "CR8 services?",
      "Contact CR8?",
      "CR8 portfolio?"
    ]
  },

  STATUS: {
    CONNECTION: {
      CONNECTED: 'connected',
      OFFLINE: 'offline', 
      UNKNOWN: 'unknown'
    },
    
    TRAINING_DATA: {
      LOADED: 'loaded',
      LOADING: 'loading',
      FALLBACK: 'fallback',
      FAILED: 'failed'
    }
  },

  FETCH: {
    HEADERS: {
      ACCEPT_TEXT: 'text/plain',
      ACCEPT_JSON: 'application/json',
      CONTENT_TYPE_JSON: 'application/json',
      CACHE_CONTROL: 'no-cache'
    },
    
    MIN_CONTENT_LENGTH: 50,
    TIMEOUT: 10000,
    MAX_RETRIES: 3
  },

  APP: {
    NAME: 'CR8 Assistant',
    MOBILE_NAME: 'CR8 AI',
    LOGO_PATH: '/img/logo.png',
    LOGO_ALT: 'CR8 Logo'
  }
};

export const PROMPT_TEMPLATE = {
  buildHybridPrompt: (userMessage, trainingData) => {
    const hasValidTrainingData = trainingData && 
                                trainingData.trim().length > CONFIG.FETCH.MIN_CONTENT_LENGTH &&
                                trainingData !== CONFIG.MESSAGES.NO_TRAINING_DATA;
    if (hasValidTrainingData) {
      return You are an AI assistant for CR8. You MUST use the following information about CR8 EXCLUSIVELY when answering questions specifically about CR8. Do not rely on any external knowledge for CR8-related queries; use only the data provided below:

=== CR8 INFORMATION ===
${trainingData.trim()}
=== END CR8 INFORMATION ===

User Question: ${userMessage}

Instructions:
1. For questions specifically about CR8 (e.g., services, contact, portfolio, technologies, about CR8), base your answer ENTIRELY on the provided CR8 information above.
2. For general questions (e.g., about AI, web development, technology concepts), provide helpful information from your general knowledge.
3. Maintain a professional, helpful tone.
4. If the question is about CR8 and the data doesn't provide a complete answer, say: "Based on the available CR8 information, [provide what you can], but I don't have complete details about that specific aspect. Feel free to ask other questions!"
5. Always be concise but informative.

Please provide a helpful response:;
    } else {
      return You are a helpful AI assistant. The user asked: "${userMessage}"

I currently don't have access to specific CR8 company information, but I can help with general questions about technology, web development, AI, programming, and other topics.

If you're asking about CR8 specifically, I apologize that I don't have detailed information available right now. However, I can still help with:
- General technology questions
- Web development concepts
- Programming help
- AI and machine learning topics
- Business technology advice

Please provide a helpful response based on general knowledge:;
    }
  }
};

export const UTILS = {
  formatTime: (timestamp) => {
    try {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  },

  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  copyToClipboard: async (text) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        console.log('Text copied to clipboard successfully');
        return;
      }
      
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          console.log('Text copied using fallback method');
        } else {
          throw new Error('Copy command failed');
        }
      } finally {
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Failed to copy text:', error);
      throw error;
    }
  },

  isValidTrainingData: (data) => {
    return data && 
           typeof data === 'string' && 
           data.trim().length > CONFIG.FETCH.MIN_CONTENT_LENGTH &&
           data.trim() !== CONFIG.MESSAGES.NO_TRAINING_DATA;
  },

  fetchWithTimeout: async (url, options = {}) => {
    const { timeout = CONFIG.FETCH.TIMEOUT, ...fetchOptions } = options;
    
    let fetchUrl = url;
    if (url.startsWith('/api/')) {
      const apiBase = CONFIG.API.getApiBase();
      fetchUrl = apiBase ? ${apiBase}${url} : url;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      console.log('Fetching with timeout:', fetchUrl);
      const response = await fetch(fetchUrl, {
        ...fetchOptions,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }
};