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

module.exports = {
  getCR8SystemPrompt,
  generateEnhancedCR8Response
};