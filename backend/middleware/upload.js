const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
['images', 'pdfs'].forEach(dir => {
  const full = path.join(uploadDir, dir);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const sub = isImage ? 'images' : 'pdfs';
    cb(null, path.join(uploadDir, sub));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImages = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const allowedDocs = ['application/pdf'];
  if ([...allowedImages, ...allowedDocs].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpg, .png, .webp, .gif images and .pdf files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = upload;
