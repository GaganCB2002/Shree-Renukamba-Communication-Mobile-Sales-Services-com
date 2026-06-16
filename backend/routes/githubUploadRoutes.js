const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadFile } = require('../services/githubUploadService');
const ActivityLog = require('../models/ActivityLog');

const memoryStorage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpg, .png, .webp, .gif images and .pdf files are allowed'), false);
  }
};
const upload = multer({ storage: memoryStorage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/', protect, admin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const tmpDir = path.join(os.tmpdir(), 'uploads');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const tmpPath = path.join(tmpDir, req.file.originalname);
    fs.writeFileSync(tmpPath, req.file.buffer);
    const url = await uploadFile(tmpPath, req.file.originalname);
    try { fs.unlinkSync(tmpPath); } catch {}
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.fullName,
      userEmail: req.user.email,
      userRole: 'admin',
      action: 'github_upload',
      resourceType: 'file',
      resourceId: req.file.originalname,
      details: { originalName: req.file.originalname, mimeType: req.file.mimetype, size: req.file.size, url },
      ipAddress: req.ip,
    });
    res.json({ url, filename: req.file.originalname, originalName: req.file.originalname, size: req.file.size });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/multiple', protect, admin, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const results = [];
    const tmpDir = path.join(os.tmpdir(), 'uploads');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    for (const f of req.files) {
      const tmpPath = path.join(tmpDir, f.originalname);
      fs.writeFileSync(tmpPath, f.buffer);
      const url = await uploadFile(tmpPath, f.originalname);
      try { fs.unlinkSync(tmpPath); } catch {}
      results.push({ url, filename: f.originalname, originalName: f.originalname, size: f.size });
    }
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.fullName,
      userEmail: req.user.email,
      userRole: 'admin',
      action: 'github_upload_multiple',
      resourceType: 'file',
      details: { files: results.map(r => ({ originalName: r.originalName, url: r.url })) },
      ipAddress: req.ip,
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
