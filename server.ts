import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Helper: Call Gemini with exponential backoff retry and fallback model cascade
async function generateWithRetryAndFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    systemInstruction?: string;
  },
  models: string[] = ['gemini-2.5-pro', 'gemini-3.7-flash', 'gemini-2.5-flash', 'gemini-flash-latest']
) {
  let lastError: any = null;

  for (const model of models) {
    // Retry up to 3 times per model for 503 / 429 / UNAVAILABLE / High demand
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: {
            ...params.config,
            ...(params.systemInstruction ? { systemInstruction: params.systemInstruction } : {}),
          },
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errMessage = String(err?.message || '');
        const statusCode = err?.status || err?.code || 0;
        const isOverloadedOrRateLimit =
          statusCode === 503 ||
          statusCode === 429 ||
          statusCode === 500 ||
          errMessage.includes('503') ||
          errMessage.includes('429') ||
          errMessage.includes('high demand') ||
          errMessage.includes('UNAVAILABLE') ||
          errMessage.includes('RESOURCE_EXHAUSTED') ||
          errMessage.includes('overloaded');

        if (isOverloadedOrRateLimit && attempt < 2) {
          const delay = Math.pow(2, attempt) * 800 + Math.random() * 400;
          console.warn(`[StudyGem AI] Model ${model} is experiencing high demand (attempt ${attempt + 1}/3). Retrying in ${Math.round(delay)}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          // Move on to next fallback model
          break;
        }
      }
    }
    console.warn(`[StudyGem AI] Attempting fallback model after ${model} was unavailable...`);
  }

  throw lastError || new Error('All AI model attempts were unavailable. Please try again in a few moments.');
}

// Helper: Safely extract and parse JSON from model response
function parseModelJson(rawText: string | undefined): any {
  if (!rawText) return {};
  const text = rawText.trim();
  try {
    return JSON.parse(text);
  } catch {
    // Attempt markdown fence strip
    let cleaned = text.replace(/^[^{[]*```(?:json)?\s*/i, '').replace(/\s*```[^}\]]*$/i, '').trim();
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    const startIdx = firstBrace !== -1 && firstBracket !== -1 ? Math.min(firstBrace, firstBracket) : Math.max(firstBrace, firstBracket);
    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');
    const endIdx = Math.max(lastBrace, lastBracket);

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      cleaned = cleaned.slice(startIdx, endIdx + 1);
    }
    return JSON.parse(cleaned);
  }
}

// YouTube URL parser helper (supports watch?v=, youtu.be, /shorts/, /live/, /embed/, &v=)
function extractYouTubeID(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|live\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.trim().match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Endpoint: Extract YouTube video metadata (oEmbed / fallback)
app.post('/api/youtube/info', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const videoId = extractYouTubeID(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Attempt to fetch oEmbed metadata for title & author
    let title = 'YouTube Lecture';
    let author_name = 'Educator';
    let thumbnail_url = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        title = data.title || title;
        author_name = data.author_name || author_name;
        thumbnail_url = data.thumbnail_url || thumbnail_url;
      }
    } catch {
      // Fallback
    }

    res.json({
      videoId,
      title,
      author_name,
      thumbnail_url,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch video info' });
  }
});

// Endpoint: Generate Full YouTube Video Study Suite Notes
app.post('/api/gemini/youtube-notes', async (req, res) => {
  try {
    const { videoUrl, videoTitle, rawTranscript, subject, targetLevel } = req.body;
    const ai = getGeminiClient();

    const videoId = videoUrl ? extractYouTubeID(videoUrl) : null;

    const systemInstruction = `You are StudyGem's master academic study synthesizer and educational AI.
Your goal is to convert video lecture content or transcripts into the world's best, ultra-structured student study packet.
Structure your output in strictly valid JSON matching this schema:
{
  "title": "Clean, descriptive academic title",
  "subject": "e.g. Computer Science, Organic Chemistry, World History, Calculus",
  "difficulty": "Beginner | Intermediate | Advanced",
  "estimatedReadTime": "e.g. 6 min read",
  "executiveSummary": "2-3 concise paragraphs summarizing core concepts, why it matters, and big picture takeaways.",
  "keyTakeaways": [
    "High-impact bullet point 1",
    "High-impact bullet point 2",
    "High-impact bullet point 3",
    "High-impact bullet point 4",
    "High-impact bullet point 5"
  ],
  "timestampedSections": [
    {
      "timestamp": "00:00",
      "topic": "Section Headline",
      "summary": "Detailed explanation with formula/syntax/examples where appropriate.",
      "keyTerms": ["term1", "term2"]
    }
  ],
  "cornellNotes": {
    "cuesAndQuestions": [
      "What is the primary mechanism of X?",
      "How does Y differ from Z?",
      "Why is condition A required?"
    ],
    "detailedNotes": "Rich formatted Markdown with headings (##), bold key concepts, bullet lists, math equations, code or diagrams in ASCII if applicable.",
    "bottomSummary": "A concise 2-sentence synthesis for rapid pre-exam review."
  },
  "keyDefinitions": [
    {
      "term": "Term Name",
      "definition": "Clear, memorable student-friendly definition",
      "exampleOrMnemonic": "Quick memory hook or real-world example"
    }
  ],
  "flashcards": [
    {
      "front": "Active recall question or prompt",
      "back": "Precise, complete answer"
    }
  ],
  "quiz": [
    {
      "question": "Multiple choice question testing deep understanding?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this option is correct and why other distractors are wrong."
    }
  ],
  "mindmap": [
    {
      "mainBranch": "Core Theme 1",
      "subNodes": ["Sub-concept A", "Sub-concept B", "Practical application"]
    }
  ],
  "actionChecklist": [
    "Review formula X derivation",
    "Practice 3 problems on concept Y",
    "Memorize definitions of key terms"
  ]
}`;

    const prompt = `Generate a comprehensive StudyGem academic study suite for this video:
Video Title: ${videoTitle || 'Educational Video'}
Video URL: ${videoUrl || 'N/A'} (ID: ${videoId || 'N/A'})
Academic Subject: ${subject || 'General Academic'}
Target Level: ${targetLevel || 'College / High School'}
Transcript / Content Notes provided by student:
${rawTranscript ? rawTranscript.slice(0, 25000) : 'Analyze and synthesize exhaustive notes based on this educational topic and standard university curriculum for ' + (videoTitle || 'this subject') + '.'}

Return ONLY the raw JSON object conforming to the schema.`;

    const response = await generateWithRetryAndFallback(ai, {
      contents: prompt,
      systemInstruction,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const data = parseModelJson(response.text);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error generating notes:', error);
    res.status(500).json({ error: error.message || 'Failed to generate study notes' });
  }
});

// Endpoint: Generate Flashcards from any topic/text
app.post('/api/gemini/flashcards', async (req, res) => {
  try {
    const { topic, text, count = 10, difficulty = 'Intermediate' } = req.body;
    const ai = getGeminiClient();

    const response = await generateWithRetryAndFallback(ai, {
      contents: `Create ${count} high-yield active-recall study flashcards on the topic: "${topic}".
Difficulty level: ${difficulty}.
Source Text (if provided): ${text ? text.slice(0, 15000) : 'Generate comprehensive cards from core academic syllabus.'}

Return JSON with this structure:
{
  "deckTitle": "Deck Name",
  "subject": "Subject Name",
  "cards": [
    {
      "id": "c1",
      "front": "Targeted active recall question or prompt",
      "back": "Clear, concise answer with key terms bolded",
      "category": "Concept | Definition | Application | Formula",
      "hint": "Optional helpful hint"
    }
  ]
}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseModelJson(response.text);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate flashcards' });
  }
});

// Endpoint: Generate Practice Exam & Quiz
app.post('/api/gemini/quiz', async (req, res) => {
  try {
    const { topic, text, numQuestions = 6, difficulty = 'Exam Level' } = req.body;
    const ai = getGeminiClient();

    const response = await generateWithRetryAndFallback(ai, {
      contents: `Create a rigorous ${numQuestions}-question student practice exam on: "${topic}".
Difficulty: ${difficulty}.
Text context: ${text ? text.slice(0, 15000) : 'Base questions on high-probability university/AP exam standards.'}

Return JSON format:
{
  "quizTitle": "Practice Exam Title",
  "timeLimitMinutes": 15,
  "totalPoints": 100,
  "questions": [
    {
      "id": "q1",
      "question": "Clear, rigorous question text?",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correctIndex": 0,
      "explanation": "Detailed step-by-step rationale for why this is correct and why other choices are traps.",
      "topicTag": "Topic subcategory"
    }
  ]
}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseModelJson(response.text);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate quiz' });
  }
});

// Endpoint: Generate Formula & Concept Cheat Sheet
app.post('/api/gemini/cheat-sheet', async (req, res) => {
  try {
    const { topic, subject } = req.body;
    const ai = getGeminiClient();

    const response = await generateWithRetryAndFallback(ai, {
      contents: `Generate an ultra-condensed, high-yield Formula & Concept Cheat Sheet for: "${topic}" (${subject || 'General STEM/Humanities'}).

Return JSON format:
{
  "title": "Master Cheat Sheet Title",
  "subject": "Subject",
  "sections": [
    {
      "sectionName": "Core Equations & Formulas",
      "items": [
        {
          "name": "Formula Name",
          "formula": "Equation (e.g. F = ma or Bayes Theorem)",
          "variables": "What each variable means and standard units",
          "whenToUse": "Key exam triggers / conditions"
        }
      ]
    },
    {
      "sectionName": "Crucial Laws & Theorems",
      "items": [
        {
          "name": "Law/Theorem Name",
          "formula": "Statement or Law",
          "variables": "Key implications",
          "whenToUse": "Typical exam scenario"
        }
      ]
    },
    {
      "sectionName": "Mnemonics & Memory Hooks",
      "items": [
        {
          "name": "Mnemonic Phrase",
          "formula": "Acronym breakdown",
          "variables": "What it helps you remember",
          "whenToUse": "Order of operations / classifications"
        }
      ]
    },
    {
      "sectionName": "Top 5 Exam Traps & Common Mistakes",
      "items": [
        {
          "name": "Common Error #1",
          "formula": "Mistake vs Correction",
          "variables": "Why students lose points",
          "whenToUse": "Check before submitting test"
        }
      ]
    }
  ]
}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseModelJson(response.text);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate cheat sheet' });
  }
});

// Endpoint: Essay & Assignment Outline Assistant
app.post('/api/gemini/essay-helper', async (req, res) => {
  try {
    const { essayPrompt, paperType, wordCountTarget, citationStyle } = req.body;
    const ai = getGeminiClient();

    const response = await generateWithRetryAndFallback(ai, {
      contents: `Create a structured academic paper blueprint for:
Prompt: "${essayPrompt}"
Type: ${paperType || 'Argumentative Essay'}
Target Word Count: ${wordCountTarget || '1500 words'}
Citation Style: ${citationStyle || 'APA 7th edition'}

Return JSON format:
{
  "paperTitle": "Compelling Academic Title",
  "thesisStatement": "Strong, argumentative, defensible thesis statement",
  "counterArgument": "Key opposing viewpoint and how to refute it",
  "introduction": {
    "hook": "Engaging opening hook",
    "background": "Historical/conceptual context to introduce",
    "thesisPlacement": "How to transition into the thesis statement"
  },
  "bodyParagraphs": [
    {
      "paragraphNumber": 1,
      "topicSentence": "Main argument of this section",
      "evidenceSuggestions": ["Primary source / study to cite", "Empirical data point"],
      "analysisGuidance": "How to explain the evidence connecting to the thesis",
      "transition": "Connecting phrase to next paragraph"
    }
  ],
  "conclusion": {
    "restatedThesis": "Restated thesis in fresh phrasing",
    "synthesis": "Synthesis of major points without mechanical repetition",
    "finalTakeaway": "Broader implication / call to thought"
  },
  "recommendedSources": [
    {
      "title": "Scholarly Topic / Search Query",
      "type": "Peer-reviewed journal / Academic book",
      "sampleCitation": "Sample citation in ${citationStyle || 'APA'}"
    }
  ]
}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseModelJson(response.text);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate essay outline' });
  }
});

// Endpoint: Smart Study Planner Generator
app.post('/api/gemini/study-plan', async (req, res) => {
  try {
    const { examName, daysRemaining, hoursPerDay, topicsList } = req.body;
    const ai = getGeminiClient();

    const response = await generateWithRetryAndFallback(ai, {
      contents: `Design an optimal Spaced-Repetition Revision Schedule for:
Exam: "${examName}"
Days Remaining until Exam: ${daysRemaining}
Hours available per day: ${hoursPerDay} hours
Topics to cover: ${topicsList}

Return JSON format:
{
  "planTitle": "Study Plan Name",
  "totalStudyHours": 20,
  "dailyTargetMinutes": 120,
  "strategyOverview": "Why this pacing guarantees mastery without burnout",
  "schedule": [
    {
      "dayNumber": 1,
      "phase": "Foundation | Active Practice | Mock Exam | High-Yield Review",
      "dayTitle": "Theme of the day",
      "sessions": [
        {
          "duration": "45 mins",
          "task": "Specific actionable study task",
          "technique": "Feynman Technique | Pomodoro | Blurting | Flashcard Drill"
        }
      ],
      "milestone": "Check for mastery before ending the day"
    }
  ],
  "proTips": [
    "Sleep and memory consolidation advice",
    "Pre-exam morning routine recommendation"
  ]
}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseModelJson(response.text);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate study plan' });
  }
});

// Endpoint: Ask Video / Study Notes AI Chat
app.post('/api/gemini/chat-notes', async (req, res) => {
  try {
    const { question, contextNotes, chatHistory = [] } = req.body;
    const ai = getGeminiClient();

    const prompt = `You are the StudyGem AI Tutor. Answer the student's question accurately, clearly, and pedagogically based on the study material.
Context notes:
${contextNotes ? contextNotes.slice(0, 15000) : 'General academic topic'}

Student Question: "${question}"

Provide a clear explanation with bullet points, examples, or memory hooks if helpful.`;

    const response = await generateWithRetryAndFallback(ai, {
      contents: prompt,
      systemInstruction: 'You are an encouraging, brilliant university professor tutor who explains hard concepts simply and accurately with formatting.',
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to answer question' });
  }
});

// Explicit SEO Endpoints: robots.txt and sitemap.xml
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nSitemap: https://studygem.app/sitemap.xml\n`);
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://studygem.app/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>https://studygem.app/youtube-notes</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>https://studygem.app/cornell-notes</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>https://studygem.app/flashcards</loc><changefreq>daily</changefreq><priority>0.85</priority></url>
  <url><loc>https://studygem.app/quiz</loc><changefreq>daily</changefreq><priority>0.85</priority></url>
  <url><loc>https://studygem.app/cheat-sheet</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://studygem.app/study-planner</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://studygem.app/essay-helper</loc><changefreq>weekly</changefreq><priority>0.75</priority></url>
  <url><loc>https://studygem.app/focus-room</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>
  <url><loc>https://studygem.app/study-hub</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
</urlset>`);
});

// Vite & Static Asset Handling
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyGem Server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;

if (process.env.VERCEL !== '1') {
  setupVite().catch((err) => {
    console.error('Failed to start server:', err);
  });
}
