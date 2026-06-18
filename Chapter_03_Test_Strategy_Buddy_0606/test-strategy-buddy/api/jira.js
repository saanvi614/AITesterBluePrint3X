export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { jiraBase, jiraAuth, method = 'GET', jiraPath, body: jiraBody } = req.body || {}

  if (!jiraBase || !jiraAuth || !jiraPath) {
    return res.status(400).json({ error: 'Missing: jiraBase, jiraAuth, or jiraPath' })
  }

  const url = `${jiraBase.replace(/\/$/, '')}${jiraPath}`

  try {
    const opts = {
      method,
      headers: {
        'Authorization': jiraAuth,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }
    if (jiraBody && method !== 'GET') opts.body = JSON.stringify(jiraBody)

    const jiraRes = await fetch(url, opts)
    const data = await jiraRes.json().catch(() => ({}))
    res.status(jiraRes.status).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}