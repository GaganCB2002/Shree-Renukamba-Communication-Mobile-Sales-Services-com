const path = require('path');
const fs = require('fs');

const uploadFile = async (filePath, filename) => {
  const destDir = path.join(__dirname, '..', 'uploads', 'github');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const destPath = path.join(destDir, filename);
  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, destPath);
  }
  return `/uploads/github/${filename}`;
};

const deleteFile = async (filePath) => {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
  return { success: true };
};

module.exports = { uploadFile, deleteFile };
