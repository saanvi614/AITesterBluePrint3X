import { NextRequest, NextResponse } from 'next/server';
import { checkApiKeys } from '@/lib/agents';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const keys = {
      groqKey:   typeof body.groqKey   === 'string' ? body.groqKey.trim()   : undefined,
      geminiKey: typeof body.geminiKey === 'string' ? body.geminiKey.trim() : undefined,
    };

    if (!keys.groqKey && !keys.geminiKey) {
      return NextResponse.json({ error: 'Provide at least one key' }, { status: 400 });
    }

    const { groqOk, geminiOk } = await checkApiKeys(keys);
    return NextResponse.json({ groqOk, geminiOk });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
