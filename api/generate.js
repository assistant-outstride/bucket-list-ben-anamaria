export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const prompt = `Generate one absolutely wild, memorable, slightly unhinged bucket list adventure idea for two close friends. 
Make it specific, vivid, and genuinely exciting — not generic stuff like "skydiving" or "see the northern lights". 
Think: unusual locations, bizarre festivals, ridiculous challenges, hidden gems, epic journeys.
Return ONLY a JSON object with these fields:
- title: short punchy name (max 8 words)
- emoji: 1-2 relevant emojis
- location: city/country or region
- tagline: one sentence that makes it sound irresistible (max 20 words)

Example format:
{"title":"Attend the World Bog Snorkelling Championship","emoji":"🐸🏊","location":"Llanwrtyd Wells, Wales","tagline":"Race through a peat bog in a wetsuit. Losers buy the pints."}

Only return valid JSON. No markdown. No explanation.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 1.1,
        max_tokens: 200,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    const idea = JSON.parse(text);
    return res.status(200).json(idea);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to generate idea', detail: e.message });
  }
}
