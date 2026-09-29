require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { z } = require('zod');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// JSON File Database Setup
const DB_FILE = path.join(__dirname, 'data.json');

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = { entries: [], streak: { last_date: null, count: 0 } };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const analyzeSchema = z.object({
  thought: z.string().min(3).max(2000),
  mood: z.number().int().min(1).max(5),
  challengeLevel: z.enum(['Gentle', 'Balanced', 'Rigorous']).default('Balanced'),
  tags: z.array(z.string()).optional().default([])
});

const cbtSchema = z.object({
  distortions: z.array(z.object({ name: z.string(), explanation: z.string() })),
  evidence_for: z.array(z.string()),
  evidence_against: z.array(z.string()),
  balanced_thought: z.string(),
  action_step: z.string(),
  anxiety_rating_before_after: z.object({ before: z.number(), estimated_after: z.number() })
});

function updateStreak(db) {
  const today = new Date().toISOString().split('T')[0];
  const streak = db.streak;
  if (!streak.last_date) {
    streak.last_date = today;
    streak.count = 1;
  } else {
    const diff = Math.ceil(Math.abs(new Date(today) - new Date(streak.last_date)) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      streak.last_date = today;
      streak.count += 1;
    } else if (diff > 1) {
      streak.last_date = today;
      streak.count = 1;
    }
  }
}

app.get('/api/entries', (req, res) => {
  const db = readDB();
  res.json(db.entries);
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { thought, mood, challengeLevel, tags } = analyzeSchema.parse(req.body);

    if (/(suicide|kill myself|end my life|want to die|self-harm)/i.test(thought)) {
      return res.json({ crisisDetected: true, message: "We noticed language indicating severe distress. Please call 988 or reach out for professional support immediately." });
    }

    const systemPrompt = `You are a warm CBT therapist assistant (${challengeLevel} tone). You must respond with valid JSON ONLY matching this exact structure, with no extra conversational text or markdown wrappers:
{
  "distortions": [{"name": "string", "explanation": "string"}],
  "evidence_for": ["string"],
  "evidence_against": ["string"],
  "balanced_thought": "string",
  "action_step": "string",
  "anxiety_rating_before_after": {"before": 0, "estimated_after": 0}
}`;

    const userPrompt = `Analyze this anxious thought using CBT principles: "${thought}"`;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3
      })
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.text();
      throw new Error(`Groq API error: ${errBody}`);
    }

    const groqData = await groqRes.json();
    const rawText = groqData.choices[0].message.content;
    const analysis = cbtSchema.parse(JSON.parse(rawText));

    const db = readDB();
    const newEntry = {
      id: Date.now(),
      thought,
      mood,
      challenge_level: challengeLevel,
      tags: tags || [],
      analysis,
      feedback: 0,
      created_at: new Date().toISOString()
    };

    db.entries.unshift(newEntry);
    updateStreak(db);
    writeDB(db);

    res.json({ crisisDetected: false, entry: newEntry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

app.delete('/api/entries/:id', (req, res) => {
  const db = readDB();
  db.entries = db.entries.filter(e => e.id !== Number(req.params.id));
  writeDB(db);
  res.json({ success: true });
});

app.post('/api/entries/:id/feedback', (req, res) => {
  const db = readDB();
  const entry = db.entries.find(e => e.id === Number(req.params.id));
  if (entry) {
    entry.feedback = req.body.feedback;
    writeDB(db);
  }
  res.json({ success: true });
});

app.get('/api/stats', (req, res) => {
  const db = readDB();
  res.json({ streak: db.streak.count, totalEntries: db.entries.length });
});

app.listen(PORT, () => console.log(`Doubt Diary server running on port ${PORT} using Groq + JSON DB`));