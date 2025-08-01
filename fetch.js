

const express = require('express'); const router = express.Router(); const fetch = require('node-fetch'); require('dotenv').config();

const OPENAI_KEY = process.env.OPENAI_API_KEY;

router.post('/', async (req, res) => { const userMessage = req.body.message;

if (!OPENAI_KEY) { return res.status(500).json({ error: 'Missing OpenAI API key' }); }

if (!userMessage) { return res.status(400).json({ error: 'Missing message content' }); }

try { const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': Bearer ${OPENAI_KEY} }, body: JSON.stringify({ model: 'gpt-4', messages: [ { role: 'system', content: 'You are Spark, a helpful assistant.' }, { role: 'user', content: userMessage } ] }) });

const data = await openaiRes.json();
const reply = data.choices?.[0]?.message?.content || '[no reply]';
res.json({ reply });

} catch (err) { console.error('GPT error:', err); res.status(500).json({ error: 'GPT request failed' }); } });

module.exports = router;

