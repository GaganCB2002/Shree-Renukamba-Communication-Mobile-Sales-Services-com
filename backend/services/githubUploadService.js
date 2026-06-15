const { Octokit } = require('@octokit/rest');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const UPLOAD_FOLDER = process.env.GITHUB_UPLOAD_FOLDER || 'uploads';

let octokit = null;
if (GITHUB_TOKEN && GITHUB_OWNER && GITHUB_REPO) {
  octokit = new Octokit({ auth: GITHUB_TOKEN });
}

const uploadToGitHub = async (fileBuffer, fileName, mimeType) => {
  if (!octokit) {
    throw new Error('GitHub not configured. Set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO in .env');
  }

  const ext = path.extname(fileName).toLowerCase();
  const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
  const subFolder = isImage ? 'images' : 'docs';
  const githubPath = `${UPLOAD_FOLDER}/${subFolder}/${Date.now()}-${fileName}`;

  const content = Buffer.from(fileBuffer).toString('base64');

  try {
    const result = await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: githubPath,
      message: `Upload ${fileName} via admin`,
      content,
      branch: GITHUB_BRANCH,
    });

    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${githubPath}`;
    return {
      url: rawUrl,
      filename: path.basename(githubPath),
      originalName: fileName,
      size: fileBuffer.length,
      githubPath,
    };
  } catch (err) {
    throw new Error(`GitHub upload failed: ${err.message}`);
  }
};

const deleteFromGitHub = async (githubPath) => {
  if (!octokit) return;

  try {
    const { data } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: githubPath,
      branch: GITHUB_BRANCH,
    });

    await octokit.repos.deleteFile({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: githubPath,
      message: `Delete ${path.basename(githubPath)}`,
      sha: data.sha,
      branch: GITHUB_BRANCH,
    });
  } catch (err) {
    console.error('GitHub delete failed:', err.message);
  }
};

module.exports = { uploadToGitHub, deleteFromGitHub };
