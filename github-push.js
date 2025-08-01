const GITHUB_REPO = 'FireNSpark/spark';
const GITHUB_BRANCH = 'main';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}`;
const GITHUB_TOKEN = localStorage.getItem('spark_github_token');

async function pushToGitHub(path, content, message) {
  const headers = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  const getUrl = `${GITHUB_API_URL}/contents/${path}?ref=${GITHUB_BRANCH}`;
  const current = await fetch(getUrl, { headers });
  const currentJson = await current.json();
  const sha = currentJson.sha;

  const updatePayload = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    sha,
    branch: GITHUB_BRANCH,
  };

  const putUrl = `${GITHUB_API_URL}/contents/${path}`;
  const response = await fetch(putUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updatePayload),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Failed to push ${path}: ${err.message}`);
  }

  const result = await response.json();
  console.log(`✅ Pushed ${path}:`, result.commit.sha);
  return result;
}
