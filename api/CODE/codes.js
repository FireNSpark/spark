// Vercel Serverless Function: GET /api/code/codes
export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // kill caching so you don’t get stale responses
  res.setHeader('Cache-Control', 'no-store');

  // return your codes
  return res.status(200).json([
    { name: 'ALPHA', value: '123' },
    { name: 'BETA',  value: '456' }
  ]);
}
