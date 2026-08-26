const MODEL = 'gemini-2.5-flash';

function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0];
      return id.length === 11 ? id : null;
    }

    if (parsed.hostname === 'youtube.com' || parsed.hostname.endsWith('.youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v && v.length === 11) return v;

      const parts = parsed.pathname.split('/').filter(Boolean);
      const index = ['shorts', 'embed', 'live', 'v'].indexOf(parts[0] || '');
      if (index !== -1 && parts[index + 1]?.length === 11) {
        return parts[index + 1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

function cleanJson(text: string): unknown {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const withoutFence = trimmed
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    try {
      return JSON.parse(withoutFence);
    } catch {
      const start = withoutFence.indexOf('{');
      const end = withoutFence.lastIndexOf('}');
      if (start >= 0 && end > start) {
        return JSON.parse(withoutFence.slice(start, end + 1));
      }
    }
  }

  throw new Error('Gemini returned an invalid JSON response.');
}

function normalizeNotes(data: any, videoUrl: string, videoId: string) {
  return {
    id: `yt-${videoId}-${Date.now()}`,
    title: String(data?.title || 'YouTube Lecture Notes'),
    videoUrl,
    videoId,
    subject: String(data?.subject || 'General Academic'),
    difficulty: String(data?.difficulty || 'Intermediate'),
    estimatedReadTime: String(data?.estimatedReadTime || '8 min read'),
    executiveSummary: String(data?.executiveSummary || ''),
    keyTakeaways: Array.isArray(data?.keyTakeaways) ? data.keyTakeaways.map(String) : [],
    timestampedSections: Array.isArray(data?.timestampedSections)
      ? data.timestampedSections.map((item: any) => ({
          timestamp: String(item?.timestamp || '00:00'),
          topic: String(item?.topic || 'Section'),
          summary: String(item?.summary || ''),
          keyTerms: Array.isArray(item?.keyTerms) ? item.keyTerms.map(String) : [],
        }))
      : [],
    cornellNotes: {
      cuesAndQuestions: Array.isArray(data?.cornellNotes?.cuesAndQuestions)
        ? data.cornellNotes.cuesAndQuestions.map(String)
        : [],
      detailedNotes: String(data?.cornellNotes?.detailedNotes || ''),
      bottomSummary: String(data?.cornellNotes?.bottomSummary || ''),
    },
    keyDefinitions: Array.isArray(data?.keyDefinitions)
      ? data.keyDefinitions.map((item: any) => ({
          term: String(item?.term || ''),
          definition: String(item?.definition || ''),
          exampleOrMnemonic: String(item?.exampleOrMnemonic || ''),
        }))
      : [],
    flashcards: Array.isArray(data?.flashcards)
      ? data.flashcards.map((item: any) => ({
          front: String(item?.front || ''),
          back: String(item?.back || ''),
        }))
      : [],
    quiz: Array.isArray(data?.quiz)
      ? data.quiz.map((item: any) => ({
          question: String(item?.question || ''),
          options: Array.isArray(item?.options) ? item.options.map(String) : [],
          correctIndex: Number.isInteger(item?.correctIndex) ? item.correctIndex : 0,
          explanation: String(item?.explanation || ''),
        }))
      : [],
    mindmap: Array.isArray(data?.mindmap)
      ? data.mindmap.map((item: any) => ({
          mainBranch: String(item?.mainBranch || ''),
          subNodes: Array.isArray(item?.subNodes) ? item.subNodes.map(String) : [],
        }))
      : [],
    actionChecklist: Array.isArray(data?.actionChecklist) ? data.actionChecklist.map(String) : [],
    createdAt: new Date().toISOString(),
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is missing. Add it in Vercel → Settings → Environment Variables and redeploy.',
    });
  }

  const body = req.body || {};
  const videoUrl = typeof body.videoUrl === 'string' ? body.videoUrl.trim() : '';
  const rawTranscript = typeof body.rawTranscript === 'string' ? body.rawTranscript.trim() : '';
  const subject = typeof body.subject === 'string' ? body.subject : 'General Academic';
  const targetLevel = typeof body.targetLevel === 'string' ? body.targetLevel : 'College Intro / AP';

  if (!videoUrl && !rawTranscript) {
    return res.status(400).json({ error: 'Please provide a YouTube URL or transcript.' });
  }

  const videoId = videoUrl ? extractYouTubeId(videoUrl) : null;
  if (videoUrl && !videoId) {
    return res.status(400).json({ error: 'Please enter a valid public YouTube URL.' });
  }

  const schema = `{
  "title": "string",
  "subject": "string",
  "difficulty": "Beginner | Intermediate | Advanced",
  "estimatedReadTime": "string",
  "executiveSummary": "string",
  "keyTakeaways": ["string"],
  "timestampedSections": [{
    "timestamp": "MM:SS",
    "topic": "string",
    "summary": "string",
    "keyTerms": ["string"]
  }],
  "cornellNotes": {
    "cuesAndQuestions": ["string"],
    "detailedNotes": "Markdown string",
    "bottomSummary": "string"
  },
  "keyDefinitions": [{
    "term": "string",
    "definition": "string",
    "exampleOrMnemonic": "string"
  }],
  "flashcards": [{
    "front": "string",
    "back": "string"
  }],
  "quiz": [{
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "correctIndex": 0,
    "explanation": "string"
  }],
  "mindmap": [{
    "mainBranch": "string",
    "subNodes": ["string"]
  }],
  "actionChecklist": ["string"]
}`;

  const prompt = `You are StudyGem, an academic note-generation assistant.

Create a detailed but student-friendly study packet from the supplied YouTube lecture.
Subject: ${subject}
Target level: ${targetLevel}

Return ONLY valid JSON matching this exact structure:
${schema}

Rules:
- Use the actual content of the video when a YouTube video is supplied.
- Do not invent facts that are unrelated to the video.
- Include useful timestamps when possible.
- Make Cornell notes detailed enough for exam revision.
- Create 8-12 flashcards and 5-8 quiz questions.
- Keep definitions concise and memorable.
- Use Markdown inside detailedNotes only.
${rawTranscript ? `\nStudent-provided transcript/text:\n${rawTranscript.slice(0, 30000)}` : ''}`;

  const parts: any[] = [{ text: prompt }];

  if (videoUrl) {
    parts.push({
      file_data: {
        file_uri: videoUrl,
        mime_type: 'video/*',
      },
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
      }
    );

    const payload = await response.json();

    if (!response.ok) {
      const message = payload?.error?.message || `Gemini API returned HTTP ${response.status}.`;
      console.error('Gemini API error:', payload);
      return res.status(response.status >= 500 ? 502 : response.status).json({ error: message });
    }

    const text = Array.isArray(payload?.candidates?.[0]?.content?.parts)
      ? payload.candidates[0].content.parts.map((part: any) => part?.text || '').join('')
      : '';

    if (!text) {
      return res.status(502).json({ error: 'Gemini returned no text. Make sure the YouTube video is public and accessible.' });
    }

    const parsed = cleanJson(text);
    const data = normalizeNotes(parsed, videoUrl, videoId || 'transcript');

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('YouTube notes function error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to contact Gemini. Please try again.',
    });
  }
}
