import { NextResponse } from 'next/server';
import { excelManager } from '@/lib/excelManager';

export async function GET() {
  try {
    const rows = await excelManager.readAll();
    const sorted = [...rows].sort((a, b) => b.date.localeCompare(a.date));
    return NextResponse.json({ rows: sorted });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
