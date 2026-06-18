export async function fetchSUT(url = 'https://courses.thetestingacademy.com/') {
  try {
    // In local dev, use allorigins.win as CORS proxy; in production use Vercel serverless function
    const proxyUrl = import.meta.env.DEV
      ? `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
      : `/api/fetch-sut?url=${encodeURIComponent(url)}`
    const res = await fetch(proxyUrl)
    if (!res.ok) throw new Error(`SUT fetch failed: ${res.status}`)
    const data = await res.json()
    // Strip HTML tags, collapse whitespace
    const text = (data.contents || data.text || '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    return text.slice(0, 3000)
  } catch {
    return 'SUT content unavailable — proceeding with Epic summary as context.'
  }
}
