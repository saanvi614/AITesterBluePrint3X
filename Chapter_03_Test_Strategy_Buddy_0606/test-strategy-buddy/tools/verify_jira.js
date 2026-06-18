/**
 * Phase 2: L - Link Verification
 * Tool: verify_jira.js
 * Run: node tools/verify_jira.js
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
  console.log('\n=== Phase 2: Link — JIRA API Verification ===\n')
  const env = loadEnv()
  const base = (env.VITE_JIRA_BASE_URL || '').replace(/\/?$/, '/')
  const email = env.VITE_JIRA_EMAIL
  const token = env.VITE_JIRA_API_TOKEN

  if (!base || !email || !token) {
    console.error('FAIL: Missing JIRA credentials in .env'); process.exit(1)
  }
  console.log(`  URL:   ${base}\n  Email: ${email}\n  Token: ${token.slice(0,8)}...${token.slice(-4)} (masked)\n`)

  const auth = Buffer.from(`${email}:${token}`).toString('base64')
  const headers = { 'Authorization': `Basic ${auth}`, 'Accept': 'application/json' }

  // Test 1: Auth
  try {
    const r = await fetch(`${base}rest/api/3/myself`, { headers })
    if (!r.ok) { const e = await r.json().catch(()=>({})); console.error(`FAIL [Test 1 - Auth]: HTTP ${r.status}`, e.errorMessages || e); process.exit(1) }
    const u = await r.json()
    console.log(`  PASS [Test 1 - Auth]  →  ${u.displayName} <${u.emailAddress}>`)
  } catch(e) { console.error(`FAIL [Test 1 - Auth]: ${e.message}`); process.exit(1) }

  // Test 2: Project SCRUM
  try {
    const r = await fetch(`${base}rest/api/3/project/SCRUM`, { headers })
    if (!r.ok) { console.error(`FAIL [Test 2 - Project]: HTTP ${r.status}`); process.exit(1) }
    const p = await r.json()
    console.log(`  PASS [Test 2 - Project SCRUM]  →  ${p.name} (${p.key})`)
  } catch(e) { console.error(`FAIL [Test 2 - Project]: ${e.message}`); process.exit(1) }

  // Test 3: Issue Types
  try {
    const r = await fetch(`${base}rest/api/3/issuetype`, { headers })
    if (!r.ok) { console.error(`FAIL [Test 3 - IssueTypes]: HTTP ${r.status}`); process.exit(1) }
    const types = await r.json()
    const epic = types.find(t => t.name === 'Epic')
    console.log(`  PASS [Test 3 - IssueTypes]  →  Epic available: ${epic ? 'YES' : 'NO — check JIRA config'}`)
    console.log(`       Types: ${types.map(t=>t.name).join(', ')}`)
  } catch(e) { console.error(`FAIL [Test 3 - IssueTypes]: ${e.message}`); process.exit(1) }

  console.log('\n=== JIRA Link Verified: ALL TESTS PASSED ===\n')
}

run().catch(e => { console.error('Unexpected:', e); process.exit(1) })
