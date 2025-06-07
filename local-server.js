import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { config } from 'dotenv';
import { OpenAI } from 'openai';

config(); // Load .env

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Invalid prompt' });
    }

    // Call OpenAI chat completion
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or your preferred model
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const text = completion.choices?.[0]?.message?.content || "";

    res.json({
      candidates: [{ content: { parts: [{ text }] } }],
      content: { parts: [{ text }] },
      text,
    });
  } catch (error) {
    console.error('Error in /chat:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Local backend server listening at http://localhost:${port}`);
});
