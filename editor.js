let githubToken = null;

function setGithubToken() {
  const token = prompt("Paste your GitHub personal access token:");
  if (token?.startsWith("ghp_") || token?.length > 30) {
    githubToken = token;
    localStorage.setItem("spark_github_token", token);
    alert("✅ Token loaded. You can now edit files.");
  } else {
    alert("❌ Invalid token");
  }
}

async function editGithubFile() {
  if (!githubToken) githubToken = localStorage.getItem("spark_github_token");
  if (!githubToken) return alert("Token not set. Click 'Set GitHub Token' first.");

  const repo = prompt("GitHub repo (owner/repo):", "FireNSpark/spark");
  const path = prompt("File path to edit (e.g. index.html):");
  if (!repo || !path) return;

  const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;

  try {
    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });
    const data = await res.json();
    const original = atob(data.content);
    const updated = prompt("Edit the file:", original);
    if (updated === null) return;

    const commit = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Update ${path} via Spark`,
        content: btoa(updated),
        sha: data.sha
      })
    });

    if (commit.ok) {
      alert("✅ File committed successfully.");
    } else {
      alert("❌ Commit failed.");
    }
  } catch (err) {
    console.error(err);
    alert("❌ Error editing file.");
  }
}

// === Spark Autopush: createGithubFile ===
async function createGithubFile(path, content, message = `Create ${path} via Spark`) {
  if (!githubToken) githubToken = localStorage.getItem("spark_github_token");
  if (!githubToken) return alert("❌ Missing GitHub token");

  const repo = 'FireNSpark/spark';
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;

  const payload = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    branch: "main"
  };

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const result = await res.json();
  if (!res.ok) {
    console.error("❌ Error creating file:", result);
    return;
  }

  console.log("✅ File created:", result.content.path);
}

window.onload = () => {
  createGithubFile("spark-status.md", "# Spark is alive
Autonomous deployment test successful.");
};
