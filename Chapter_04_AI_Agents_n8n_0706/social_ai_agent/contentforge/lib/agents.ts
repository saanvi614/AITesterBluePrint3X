import Groq from 'groq-sdk';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { excelManager } from './excelManager';
import { KEYWORD_POOL } from './types';

const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GEMINI_IMAGE_MODEL = 'gemini-2.0-flash-preview-image-generation';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function getGroq(): Groq {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY not set');
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

function getGemini(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

async function groqChat(groq: Groq, prompt: string, maxTokens = 4096): Promise<string> {
  const res = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: maxTokens,
  });
  return res.choices[0]?.message?.content ?? '';
}

// ─── Agent 1 — Topic Generator ──────────────────────────────────────────────

export async function agent1TopicGenerator(): Promise<string> {
  console.log('[Agent1] Generating topic for', todayISO());
  const groq = getGroq();
  const existing = await excelManager.readAll();
  const usedTopics = existing.map((r) => r.topic).join(', ');
  const today = todayISO();

  const existing_today = existing.find((r) => r.date === today);
  if (existing_today) {
    console.log('[Agent1] Row for today already exists, skipping append');
    return existing_today.topic;
  }

  const prompt = `
You are a content strategist for an AI/QA tech blog.
Pick ONE fresh topic title for today from this keyword pool:
${KEYWORD_POOL.join(', ')}

Already used topics (do not repeat these concepts):
${usedTopics || 'None yet'}

Rules:
- The title must include one keyword from the pool.
- It must be specific and practical, not generic.
- 5-10 words max.
- Return ONLY the title, nothing else.
`.trim();

  const topic = (await groqChat(groq, prompt, 100)).trim().replace(/^["']|["']$/g, '');
  console.log('[Agent1] Topic:', topic);

  await excelManager.appendRow({
    date: today,
    topic,
    status: 'Pending',
    updatedBy: 'Agent1',
  });

  return topic;
}

// ─── Agent 2 — Content Writer ────────────────────────────────────────────────

export async function agent2ContentWriter(): Promise<void> {
  const today = todayISO();
  console.log('[Agent2] Writing content for', today);
  const groq = getGroq();

  const row = await excelManager.readByDate(today);
  if (!row) throw new Error(`No row found for ${today}`);
  const topic = row.topic;

  await excelManager.updateRow(today, { status: 'Writing', updatedBy: 'Agent2' });

  const voice = `
Voice rules:
- Direct, opinionated, technical.
- Short paragraphs (2-3 sentences max).
- Real examples and concrete numbers.
- No filler phrases: no "game-changer", "dive deep", "paradigm shift", "leverage", "delve".
- Write for practitioners who build things, not managers.
`.trim();

  const [linkedinPost, mediumArticle, igScript, ytScript, devtoArticle] = await Promise.all([
    groqChat(groq, `
${voice}

Write a LinkedIn post about: "${topic}"
- Hook in first line (no "I'm excited" openers).
- 150-200 words.
- End with a direct question or clear CTA.
- No hashtag spam — max 3 relevant tags at the end.
Return only the post text.
`, 500),

    groqChat(groq, `
${voice}

Write a 3000-word Medium article about: "${topic}"
- Use markdown with H2 and H3 headings.
- Start with a concrete problem statement (no "In today's world" openers).
- Include: real code snippets or examples, clear section breakdown, and a no-fluff conclusion.
- Structure: intro → core concepts → practical implementation → pitfalls → conclusion.
Return only the article markdown.
`, 8000),

    groqChat(groq, `
${voice}

Write an Instagram Reel/Carousel script about: "${topic}"
Format:
SLIDE 1 (Hook): ...
SLIDE 2: ...
...
SLIDE 7-10 (CTA): ...
CAPTION: ...
- Each slide: 1 bold statement or stat.
- Caption: 80 words max, 5 relevant hashtags.
Return only the script.
`, 800),

    groqChat(groq, `
${voice}

Write a YouTube video script about: "${topic}"
Format with timestamps:
[00:00] INTRO (30 sec hook — state the problem)
[00:30] CONTEXT
[02:00] MAIN CONTENT — break into 3-4 subtopics
[XX:XX] PITFALLS TO AVOID
[XX:XX] OUTRO + CTA
- Include B-roll notes in [brackets].
- Estimated total length: 8-12 minutes.
Return only the script.
`, 3000),

    groqChat(groq, `
${voice}

Write a 2000-word Dev.to article about: "${topic}"
- Use markdown with H2/H3 headings and code blocks.
- Include: a real implementation walkthrough, at least one code snippet, and links to tools mentioned.
- Tags line at top: tags: [relevant, tags, here]
- No marketing language — write for engineers.
Return only the article markdown.
`, 6000),
  ]);

  await excelManager.updateRow(today, {
    linkedinPost,
    mediumArticle,
    igScript,
    ytScript,
    devtoArticle,
    status: 'Imaging',
    updatedBy: 'Agent2',
  });

  console.log('[Agent2] Content written for', today);
}

// ─── Agent 3 — Image Generator (Gemini) ─────────────────────────────────────

export async function agent3ImageGenerator(): Promise<void> {
  const today = todayISO();
  console.log('[Agent3] Generating images for', today);
  const gemini = getGemini();

  const row = await excelManager.readByDate(today);
  if (!row) throw new Error(`No row found for ${today}`);
  const topic = row.topic;

  const imagesDir = path.join(process.cwd(), 'public', 'images');
  fs.mkdirSync(imagesDir, { recursive: true });

  const specs = [
    {
      key: 'medium' as const,
      prompt: `Professional blog cover image for an article titled "${topic}". Style: clean tech aesthetic, dark blue and cyan gradient background, abstract circuit or data flow patterns, bold modern typography placeholder area. 16:9 ratio. High quality, no text overlaid.`,
      filename: `medium_${today}.png`,
    },
    {
      key: 'linkedin' as const,
      prompt: `LinkedIn banner image for a post about "${topic}". Style: professional, modern, blue color scheme, abstract technology visualization, suitable for a B2B audience. 1200x627 ratio. Clean and polished, no text.`,
      filename: `linkedin_${today}.png`,
    },
    {
      key: 'ig' as const,
      prompt: `Instagram square image for a post about "${topic}". Style: bold, vibrant, eye-catching, gradient colors (purple to cyan), futuristic tech aesthetic, abstract AI/data visualization. 1:1 square ratio. No text.`,
      filename: `ig_${today}.png`,
    },
  ];

  const paths: { medium: string; linkedin: string; ig: string } = {
    medium: '', linkedin: '', ig: '',
  };

  for (const spec of specs) {
    try {
      const response = await gemini.models.generateContent({
        model: GEMINI_IMAGE_MODEL,
        contents: spec.prompt,
        config: {
          responseModalities: ['IMAGE', 'TEXT'],
        },
      });

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      let saved = false;

      for (const part of parts) {
        if (part.inlineData?.data) {
          const buffer = Buffer.from(part.inlineData.data, 'base64');
          const fullPath = path.join(imagesDir, spec.filename);
          fs.writeFileSync(fullPath, buffer);
          paths[spec.key] = `/images/${spec.filename}`;
          console.log(`[Agent3] Saved ${spec.key} image: ${spec.filename}`);
          saved = true;
          break;
        }
      }

      if (!saved) {
        console.warn(`[Agent3] No image data in response for ${spec.key}`);
        paths[spec.key] = '';
      }
    } catch (err) {
      console.error(`[Agent3] Error generating ${spec.key} image:`, err);
      paths[spec.key] = '';
    }
  }

  const allFailed = !paths.medium && !paths.linkedin && !paths.ig;

  await excelManager.updateRow(today, {
    linkedinImage: paths.linkedin,
    mediumImage:   paths.medium,
    igImage:       paths.ig,
    status:        allFailed ? 'Error' : 'Done',
    updatedBy:     'Agent3',
    errorMessage:  allFailed ? 'All image generations failed' : '',
  });

  console.log('[Agent3] Image generation complete for', today);
}

// ─── API Key Health Check ─────────────────────────────────────────────────────

export async function checkApiKeys(): Promise<{ groqOk: boolean; geminiOk: boolean }> {
  let groqOk = false;
  let geminiOk = false;

  try {
    const groq = getGroq();
    await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 5,
    });
    groqOk = true;
  } catch {
    groqOk = false;
  }

  try {
    const gemini = getGemini();
    await gemini.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'ping',
    });
    geminiOk = true;
  } catch {
    geminiOk = false;
  }

  return { groqOk, geminiOk };
}
