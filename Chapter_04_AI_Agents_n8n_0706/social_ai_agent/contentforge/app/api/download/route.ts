import { NextResponse } from 'next/server';
import { excelManager } from '@/lib/excelManager';
import fs from 'fs';

export async function GET() {
  try {
    const excelPath = await excelManager.getExcelPath();
    if (!fs.existsSync(excelPath)) {
      return NextResponse.json({ error: 'Excel file not found' }, { status: 404 });
    }
    const buffer = fs.readFileSync(excelPath);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="content_calendar.xlsx"',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
