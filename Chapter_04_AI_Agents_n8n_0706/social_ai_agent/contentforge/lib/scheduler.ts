import cron from 'node-cron';
import { runPipeline, setNextRun, setApiKeyStatus } from './pipeline';
import { checkApiKeys } from './agents';

let schedulerStarted = false;

function nextRunISO(): string {
  const now = new Date();
  const next = new Date(now);
  next.setHours(9, 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next.toISOString();
}

export function startScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;

  console.log('[Scheduler] Starting — daily pipeline at 09:00 local time');
  setNextRun(nextRunISO());

  // Daily 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('[Scheduler] Triggered daily pipeline');
    setNextRun(nextRunISO());
    await runPipeline();
  });

  // Update API key status every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    const { groqOk, geminiOk } = await checkApiKeys();
    setApiKeyStatus(groqOk, geminiOk);
  });

  // Initial key check (non-blocking)
  checkApiKeys().then(({ groqOk, geminiOk }) => {
    setApiKeyStatus(groqOk, geminiOk);
  }).catch(() => {});
}
