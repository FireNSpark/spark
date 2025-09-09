// /api/health.js
export default function handler(_req, res) {
  res.status(200).json({
    ok: true,
    has_OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    has_GITHUB_TOKEN: !!process.env.GITHUB_TOKEN,
    has_GIST_ID: !!process.env.GIST_ID
  });
}
