const express = require('express');
const router = express.Router();

router.get('/training-data', (req, res) => {
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

module.exports = router;