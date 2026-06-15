const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadToGitHub } = require('../services/githubUploadService');
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
    const result = await uploadToGitHub(req.file.buffer, req.file.originalname, req.file.mimetype);
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.fullName,
      userEmail: req.user.email,
      userRole: 'admin',
      action: 'github_upload',
      resourceType: 'file',
      resourceId: result.filename,
      details: { originalName: result.originalName, mimeType: req.file.mimetype, size: result.size, url: result.url, githubPath: result.githubPath },
      ipAddress: req.ip,
    });
    res.json(result);
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
    for (const f of req.files) {
      const result = await uploadToGitHub(f.buffer, f.originalname, f.mimetype);
      results.push(result);
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
