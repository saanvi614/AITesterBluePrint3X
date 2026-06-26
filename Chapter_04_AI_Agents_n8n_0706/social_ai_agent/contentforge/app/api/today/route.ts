import { NextResponse } from 'next/server';
import { excelManager } from '@/lib/excelManager';

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const row = await excelManager.readByDate(today);
    return NextResponse.json({ row: row ?? null, date: today });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
