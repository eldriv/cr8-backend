export const CONFIG = {
 API: {
  getApiBase: () => {
    return process.env.REACT_APP_API_BASE || 'http://localhost:3002';
  },
    getEndpoints: (apiBase) => ({
      BACKEND_PROXY: `${apiBase}/api/gemini`,
      HEALTH_CHECK: `${apiBase}/api/health`,
      TRAINING_DATA: `${apiBase}/api/training-data`
    })
  },
  DEFAULT_TRAINING_DATA: `CR8 - Digital Solutions Company

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
- Stay current with industry trends`,
  UI: {
    DESKTOP: { CHAT_WIDTH: 'chat-window-desktop', CHAT_HEIGHT: 'chat-window-desktop', MINIMIZED_HEIGHT: 'minimized', MINIMIZED_WIDTH: 'minimized' },
    MOBILE: { SAFE_AREA_TOP: 'safe-area-top', SAFE_AREA_BOTTOM: 'safe-area-bottom' },
    ANIMATIONS: { TYPING_DELAY: { BASE: 50, RANDOM: 50 }, BOUNCE_DELAYS: ['0.1s', '0.2s', '0.3s'] },
    FIXED_DIMENSIONS: { DESKTOP: { WIDTH: '384px', HEIGHT: '600px', MINIMIZED_HEIGHT: '56px' } }
  },
  MESSAGES: {
    DEFAULT_ERROR: 'Sorry, I encountered an error. ',
    CONNECTION_ERROR: 'Cannot connect to the backend server.',
    RETRY_MESSAGE: 'Please try again.',
    NO_RESPONSE: 'Sorry, I could not generate a response.',
    NO_TRAINING_DATA: 'Using general knowledge mode - specific CR8 data not available.',
    PLACEHOLDERS: { DESKTOP: 'Ask about CR8 or any questions...', MOBILE: 'Type your message...' },
    WELCOME: {
      SUBTITLE_LOADED: "I can help with CR8 information and general questions.",
      SUBTITLE_LOADING: "Loading CR8 data, answering general questions...",
      MOBILE_SUBTITLE: "I'm here to help with your questions."
    }
  },
  SUGGESTIONS: {
    CR8_SPECIFIC: ["What is CR8?", "What services does CR8 offer?", "Tell me about CR8's portfolio"],
    GENERAL: [],
    MOBILE_SPECIFIC: ["What is CR8?", "CR8 services?", "Contact CR8?", "CR8 portfolio?"]
  },
  STATUS: { CONNECTION: { connected: 'connected', offline: 'offline', unknown: 'unknown' }, TRAINING_DATA: { loaded: 'loaded', loading: 'loading', fallback: 'fallback', failed: 'failed' } },
  FETCH: { TIMEOUT: 30000, MAX_RETRIES: 3 },
  APP: { NAME: 'CR8 Assistant', MOBILE_NAME: 'CR8 AI', LOGO_PATH: '/img/logo.png', LOGO_ALT: 'CR8 Logo' }
};

export const PROMPT_TEMPLATE = {
  buildHybridPrompt: (userMessage, trainingData) => {
    return trainingData && trainingData.trim().length > 50 && trainingData !== CONFIG.MESSAGES.NO_TRAINING_DATA
      ? `You are CR8's AI assistant. Use only:

=== CR8 INFO ===
${trainingData.trim()}
=== END CR8 INFO ===

Question: ${userMessage}

Respond using only CR8 data for CR8 questions, general knowledge otherwise. Be concise. If CR8 data lacks details, say: "Based on CR8 info, [answer], but details are limited."`
      : `You are a general AI assistant. Question: ${userMessage}

No CR8 data available, respond with general knowledge.`;
  }
};

export const UTILS = {
  formatTime: (timestamp) => { try { return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return 'Unknown'; } },
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  copyToClipboard: async (text) => { try { await navigator.clipboard.writeText(text); } catch { console.log('Copy failed'); } },
  isValidTrainingData: (data) => data && typeof data === 'string' && data.trim().length > 50 && data !== CONFIG.MESSAGES.NO_TRAINING_DATA,
  fetchWithTimeout: async (url, options = {}) => {
    const { timeout = CONFIG.FETCH.TIMEOUT, ...fetchOptions } = options;
    for (let i = 0; i < CONFIG.FETCH.MAX_RETRIES; i++) {
      try {
        console.log(`Attempt ${i + 1}/${CONFIG.FETCH.MAX_RETRIES}: ${url}`);
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const response = await fetch(url, { ...fetchOptions, signal: controller.signal, mode: 'cors', headers: { 'Content-Type': 'application/json', ...fetchOptions.headers } });
        clearTimeout(id);
        console.log(`Success, status: ${response.status}`);
        return response;
      } catch (error) {
        console.error(`Failed: ${error.message}`);
        if (i < CONFIG.FETCH.MAX_RETRIES - 1) await UTILS.sleep(1000 * Math.pow(2, i));
        else throw error;
      }
    }
  }
};