export default async function handler(req, res) {
  const { url } = req.query
  if (!url) return res.status(400).json({ error: 'url param required' })

  try {
    const response = await fetch(decodeURIComponent(url), {
      headers: { 'User-Agent': 'TestStrategyBuddy/1.0' }
    })
    const text = await response.text()
    res.status(200).json({ contents: text })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
