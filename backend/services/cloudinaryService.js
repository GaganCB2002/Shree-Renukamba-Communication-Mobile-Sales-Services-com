const path = require('path');

const uploadImage = async (filePath) => {
  const filename = path.basename(filePath);
  return `/uploads/images/${filename}`;
};

const uploadBuffer = async (buffer, filename) => {
  const fs = require('fs');
  const uploadPath = path.join(__dirname, '..', 'uploads', 'images', filename);
  const dir = path.dirname(uploadPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(uploadPath, buffer);
  return `/uploads/images/${filename}`;
};

module.exports = { uploadImage, uploadBuffer };
