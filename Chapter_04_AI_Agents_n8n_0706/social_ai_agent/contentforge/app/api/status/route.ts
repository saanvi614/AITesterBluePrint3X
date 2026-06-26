import { NextResponse } from 'next/server';
import { getPipelineState } from '@/lib/pipeline';
import { excelManager } from '@/lib/excelManager';

export async function GET() {
  try {
    const state = getPipelineState();
    const stats = await excelManager.getStats();
    return NextResponse.json({ ...state, ...stats });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
