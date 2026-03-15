const OWNER = 'assistant-outstride';
const REPO = 'bucket-list-ben-anamaria';
const FILE_PATH = 'data/items.json';
const GH_TOKEN = process.env.GITHUB_TOKEN;

async function getFile() {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
    headers: {
      Authorization: `token ${GH_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  if (res.status === 404) return { content: { items: [] }, sha: null };
  const data = await res.json();
  const content = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
  return { content, sha: data.sha };
}

async function saveFile(content, sha) {
  const body = {
    message: `✨ Add bucket list item: ${content.items[content.items.length - 1]?.title || 'new item'}`,
    content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
  };
  if (sha) body.sha = sha;
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${GH_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return res.ok;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { content } = await getFile();
    return res.status(200).json(content);
  }

  if (req.method === 'POST') {
    const { title, emoji, location } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });
    const { content, sha } = await getFile();
    const newItem = {
      id: Date.now(),
      emoji: emoji || '🌍',
      title,
      location: location || '',
      done: false,
      addedAt: new Date().toISOString(),
    };
    content.items.push(newItem);
    const ok = await saveFile(content, sha);
    if (!ok) return res.status(500).json({ error: 'Failed to save' });
    return res.status(200).json(newItem);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
