import { agent1TopicGenerator, agent2ContentWriter, agent3ImageGenerator } from './agents';
import { PipelineState, ApiKeys } from './types';

const state: PipelineState = {
  running: false,
  currentStep: null,
  lastRun: null,
  nextRun: null,
  lastError: null,
  groqKeyOk: !!process.env.GROQ_API_KEY,
  geminiKeyOk: !!process.env.GEMINI_API_KEY,
};

export function getPipelineState(): PipelineState {
  return { ...state };
}

export function setNextRun(iso: string) {
  state.nextRun = iso;
}

export function setApiKeyStatus(groqOk: boolean, geminiOk: boolean) {
  state.groqKeyOk = groqOk;
  state.geminiKeyOk = geminiOk;
}

export async function runPipeline(keys?: ApiKeys): Promise<void> {
  if (state.running) {
    console.log('[Pipeline] Already running, skipping');
    return;
  }

  state.running = true;
  state.lastError = null;
  state.lastRun = new Date().toISOString();

  try {
    state.currentStep = 'Agent1: Generating topic';
    console.log('[Pipeline]', state.currentStep);
    await agent1TopicGenerator(keys);

    state.currentStep = 'Agent2: Writing content';
    console.log('[Pipeline]', state.currentStep);
    await agent2ContentWriter(keys);

    state.currentStep = 'Agent3: Generating images';
    console.log('[Pipeline]', state.currentStep);
    await agent3ImageGenerator(keys);

    state.currentStep = null;
    console.log('[Pipeline] Complete');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Pipeline] Error:', msg);
    state.lastError = msg;
    state.currentStep = null;
  } finally {
    state.running = false;
  }
}
