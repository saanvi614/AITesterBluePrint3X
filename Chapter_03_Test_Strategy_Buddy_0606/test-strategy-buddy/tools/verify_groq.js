/**
 * Phase 2: L - Link Verification
 * Tool: verify_groq.js
 * Run: node tools/verify_groq.js
 */
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  try {
    const lines = readFileSync(resolve(__dirname, '..', '.env'), 'utf8').split('\n')
    const env = {}
    for (const line of lines) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const idx = t.indexOf('=')
      if (idx === -1) continue
      let val = t.slice(idx + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      env[t.slice(0, idx).trim()] = val
    }
    return env
  } catch {
    console.error('ERROR: .env file not found.')
    process.exit(1)
  }
}

async function run() {
  console.log('\n=== Phase 2: Link — GROQ API Verification ===\n')
  const env = loadEnv()
  const key = env.VITE_GROQ_API_KEY
  const model = env.VITE_GROQ_MODEL || 'llama3-70b-8192'

  if (!key) { console.error('FAIL: Missing VITE_GROQ_API_KEY in .env'); process.exit(1) }
  console.log(`  Key:   ${key.slice(0,8)}...${key.slice(-4)} (masked)\n  Model: ${model}\n`)

  const headers = { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Accept': 'application/json' }

  // Test 1: List models & confirm configured model exists
  try {
    const r = await fetch('https://api.groq.com/openai/v1/models', { headers })
    if (!r.ok) {
      const e = await r.json().catch(()=>({}))
      console.error(`FAIL [Test 1 - API Key]: HTTP ${r.status}`, e.error?.message || '')
      process.exit(1)
    }
    const d = await r.json()
    const ids = (d.data || []).map(m => m.id)
    const found = ids.includes(model)
    console.log(`  PASS [Test 1 - API Key]  →  ${ids.length} models available`)
    if (!found) console.warn(`  WARN: Model "${model}" not in list.\n       Available: ${ids.join(', ')}`)
    else console.log(`  PASS [Model Check]  →  "${model}" confirmed available`)
    console.log()
  } catch(e) { console.error(`FAIL [Test 1 - API Key]: ${e.message}`); process.exit(1) }

  // Test 2: Plain-text smoke test (no json_object format)
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST', headers,
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Reply with: OK' }],
        temperature: 0,
        max_tokens: 10
      })
    })
    if (!r.ok) {
      const e = await r.json().catch(()=>({}))
      console.error(`FAIL [Test 2 - Completion]: HTTP ${r.status}`, e.error?.message || '')
      process.exit(1)
    }
    const d = await r.json()
    const reply = d.choices?.[0]?.message?.content || ''
    console.log(`  PASS [Test 2 - Chat Completion]  →  "${reply.trim()}" (${d.usage?.total_tokens || '?'} tokens)`)
  } catch(e) { console.error(`FAIL [Test 2 - Completion]: ${e.message}`); process.exit(1) }

  console.log('\n=== GROQ Link Verified: ALL TESTS PASSED ===\n')
}

run().catch(e => { console.error('Unexpected:', e); process.exit(1) })
