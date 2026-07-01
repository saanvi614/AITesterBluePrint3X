/**
 * LangFlow API helpers.
 * All paths start with /api so Vite's dev proxy forwards them to LangFlow.
 */

const DEFAULT_CONFIG = {
  baseUrl: '',           // MUST stay empty — proxy forwards /api/* to LangFlow (7860)
  apiKey: import.meta.env.VITE_API_KEY ?? '',
  flowId: '15800861-49e3-4902-8b26-0974dec180af',
  fileIdA: 'File-daKW7',
  fileIdB: 'File-IKmcY',
  prompt: 'Analyze these two Playwright runs and tell me which build has the most failing/flaky test.',
  sessionId: 'flaky-analyzer-session',
};

export function loadConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem('fta_config') ?? '{}');
    return { ...DEFAULT_CONFIG, ...saved };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(cfg) {
  localStorage.setItem('fta_config', JSON.stringify(cfg));
}

// ---------------------------------------------------------------------------

async function uploadFile(file, flowId, apiKey, baseUrl) {
  const url = `${baseUrl}/api/v1/files/upload/${flowId}`;
  const form = new FormData();
  form.append('file', file);

  const headers = {};
  if (apiKey) headers['x-api-key'] = apiKey;

  const res = await fetch(url, { method: 'POST', headers, body: form });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`File upload failed (${res.status}): ${detail}`);
  }

  const data = await res.json();
  // LangFlow returns { file_path: "..." } or { flowId, file_path }
  const path = data.file_path ?? data.path;
  if (!path) throw new Error(`Unexpected upload response: ${JSON.stringify(data)}`);
  return path;
}

async function runFlow({ flowId, apiKey, baseUrl, pathA, pathB, fileIdA, fileIdB, prompt, sessionId }) {
  const url = `${baseUrl}/api/v1/run/${flowId}?stream=false`;

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['x-api-key'] = apiKey;

  const body = {
    output_type: 'chat',
    input_type: 'text',
    input_value: prompt,
    session_id: sessionId,
    tweaks: {
      [fileIdA]: { path: [pathA] },
      [fileIdB]: { path: [pathB] },
    },
  };

  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`Flow run failed (${res.status}): ${detail}`);
  }

  return res.json();
}

function extractText(data) {
  try {
    const msg = data.outputs[0].outputs[0].results.message;
    const text = msg.text ?? msg.data?.text ?? '';
    const usage = msg.properties?.usage ?? null;
    const model = msg.properties?.model_name ?? '';
    return { text, usage, model };
  } catch {
    // Fallback: search for first non-empty text string
    const raw = JSON.stringify(data);
    const match = raw.match(/"text"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    return { text: match ? match[1].replace(/\\n/g, '\n') : JSON.stringify(data, null, 2), usage: null, model: '' };
  }
}

/**
 * Full pipeline: upload both files, run flow, return parsed result.
 * @param {File} fileA
 * @param {File} fileB
 * @param {object} config  from loadConfig()
 * @param {(msg: string) => void} onProgress
 */
export async function analyze(fileA, fileB, config, onProgress = () => {}) {
  const { baseUrl, apiKey, flowId, fileIdA, fileIdB, prompt, sessionId } = config;

  onProgress('Uploading Build A…');
  const pathA = await uploadFile(fileA, flowId, apiKey, baseUrl);

  onProgress('Uploading Build B…');
  const pathB = await uploadFile(fileB, flowId, apiKey, baseUrl);

  onProgress('Running analysis flow…');
  const raw = await runFlow({ flowId, apiKey, baseUrl, pathA, pathB, fileIdA, fileIdB, prompt, sessionId });

  return extractText(raw);
}
