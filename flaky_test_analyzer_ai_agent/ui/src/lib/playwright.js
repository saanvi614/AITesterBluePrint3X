/**
 * Parse a Playwright results.json into a concise stat summary.
 * Handles both the legacy reporter format and the newer JSON reporter format.
 */
export function parsePlaywrightResults(json) {
  // Playwright JSON reporter v2 shape: { suites, stats, ... }
  if (json.stats) {
    const s = json.stats;
    return {
      passed: s.expected ?? 0,
      failed: s.unexpected ?? 0,
      flaky: s.flaky ?? 0,
      skipped: s.skipped ?? 0,
      duration: formatMs(s.duration ?? 0),
    };
  }

  // Walk suites recursively and tally
  const tally = { passed: 0, failed: 0, flaky: 0, skipped: 0, durationMs: 0 };

  function walkSuite(suite) {
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        const results = test.results ?? [];
        const statuses = results.map((r) => r.status);
        const lastStatus = statuses.at(-1);

        if (test.status === 'skipped' || lastStatus === 'skipped') {
          tally.skipped++;
        } else if (statuses.includes('passed') && statuses.includes('failed')) {
          tally.flaky++;
        } else if (lastStatus === 'passed' || lastStatus === 'expected') {
          tally.passed++;
        } else {
          tally.failed++;
        }

        for (const r of results) {
          tally.durationMs += r.duration ?? 0;
        }
      }
    }
    for (const child of suite.suites ?? []) {
      walkSuite(child);
    }
  }

  for (const suite of json.suites ?? []) {
    walkSuite(suite);
  }

  return {
    passed: tally.passed,
    failed: tally.failed,
    flaky: tally.flaky,
    skipped: tally.skipped,
    duration: formatMs(tally.durationMs),
  };
}

function formatMs(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const m = Math.floor(ms / 60_000);
  const s = ((ms % 60_000) / 1000).toFixed(0).padStart(2, '0');
  return `${m}m ${s}s`;
}
