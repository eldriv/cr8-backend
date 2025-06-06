import express from 'express';

const app = express();
const port = process.env.PORT || 3002;

app.use(express.json());

app.post('/api/gemini', (req, res) => {
  const { message } = req.body;
  console.log('Received message:', message);
  res.json({ reply: `Echo: ${message}` });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
