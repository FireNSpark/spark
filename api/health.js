// /api/health.js
export default function handler(_req, res) {
  res.status(200).json({
    ok: true,
    has_OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    has_GITHUB_TOKEN: !!process.env.GITHUB_TOKEN,
    has_GIST_ID: !!process.env.GIST_ID,
    // Azure fields are optional; show presence if you're using Azure
    has_AZURE_OPENAI_ENDPOINT: !!process.env.AZURE_OPENAI_ENDPOINT,
    has_AZURE_OPENAI_DEPLOYMENT: !!process.env.AZURE_OPENAI_DEPLOYMENT,
    has_AZURE_OPENAI_API_VERSION: !!process.env.AZURE_OPENAI_API_VERSION
  });
}
