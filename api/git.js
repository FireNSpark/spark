// /api/git.js — Vercel Serverless Function for GitHub Gist sync

export default async function handler(req, res) {
  const { method } = req;
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GIST_ID = process.env.GIST_ID;

  if (!GITHUB_TOKEN || !GIST_ID) {
    return res.status(500).json({ error: 'Missing GitHub token or Gist ID' });
  }

  const headers = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json'
  };

  if (method === 'GET') {
    try {
      const resp = await fetch(`https://api.github.com/gists/${GIST_ID}`, { headers });
      const data = await resp.json();
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch Gist' });
    }
  }

  if (method === 'POST') {
    const { filename, content } = req.body;
    if (!filename || !content) return res.status(400).json({ error: 'Missing filename or content' });

    try {
      const resp = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          files: {
            [filename]: { content }
          }
        })
      });

      const data = await resp.json();
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update Gist' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
