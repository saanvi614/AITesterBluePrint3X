import { NextRequest, NextResponse } from 'next/server';
import { runPipeline, getPipelineState } from '@/lib/pipeline';

export async function POST(req: NextRequest) {
  const state = getPipelineState();
  if (state.running) {
    return NextResponse.json(
      { error: 'Pipeline is already running', step: state.currentStep },
      { status: 409 }
    );
  }

  const groqKey   = req.headers.get('x-groq-key')   ?? undefined;
  const geminiKey = req.headers.get('x-gemini-key')  ?? undefined;
  const keys      = (groqKey || geminiKey) ? { groqKey, geminiKey } : undefined;

  runPipeline(keys).catch((err) => {
    console.error('[/api/run] Unhandled pipeline error:', err);
  });

  return NextResponse.json({ started: true, message: 'Pipeline started' });
}
