import { NextResponse } from 'next/server';
import { runPipeline, getPipelineState } from '@/lib/pipeline';

export async function POST() {
  const state = getPipelineState();
  if (state.running) {
    return NextResponse.json(
      { error: 'Pipeline is already running', step: state.currentStep },
      { status: 409 }
    );
  }

  // Fire and forget — caller polls /api/status for progress
  runPipeline().catch((err) => {
    console.error('[/api/run] Unhandled pipeline error:', err);
  });

  return NextResponse.json({ started: true, message: 'Pipeline started' });
}
