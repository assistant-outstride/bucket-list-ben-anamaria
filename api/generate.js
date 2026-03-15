export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const count = Math.min(parseInt(req.query.count || '10'), 20);

  const prompt = `Generate ${count} completely different, wild, memorable bucket list adventure ideas for two close friends.
Make them specific, vivid, and genuinely exciting — NOT generic stuff like skydiving or northern lights.
Think: bizarre festivals, unusual locations, ridiculous challenges, hidden gems, epic journeys, surreal experiences.
Each idea must be totally different from the others — different countries, different vibes, different energy.

Return ONLY a valid JSON array of ${count} objects. Each object:
- title: short punchy name (max 8 words)
- emoji: 1-2 relevant emojis  
- location: city/country or region
- tagline: one sentence that makes it irresistible (max 20 words)

Example item: {"title":"Compete in the World Bog Snorkelling Championship","emoji":"🐸🏊","location":"Llanwrtyd Wells, Wales","tagline":"Race through a peat bog in a wetsuit. Losers buy the pints."}

Return ONLY the JSON array. No markdown. No explanation. No wrapper object.`;

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
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    const ideas = JSON.parse(text);
    return res.status(200).json(Array.isArray(ideas) ? ideas : [ideas]);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to generate ideas', detail: e.message });
  }
}
