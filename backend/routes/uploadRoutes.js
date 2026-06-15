const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, admin } = require('../middleware/authMiddleware');
const ActivityLog = require('../models/ActivityLog');

router.post('/', protect, admin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const url = `/uploads/${req.file.mimetype.startsWith('image/') ? 'images' : 'pdfs'}/${req.file.filename}`;
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.fullName,
      userEmail: req.user.email,
      userRole: 'admin',
      action: 'upload',
      resourceType: 'file',
      resourceId: req.file.filename,
      details: { originalName: req.file.originalname, mimeType: req.file.mimetype, size: req.file.size, url },
      ipAddress: req.ip,
    });
    res.json({ url, filename: req.file.filename, originalName: req.file.originalname, size: req.file.size });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/multiple', protect, admin, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const files = req.files.map(f => ({
      url: `/uploads/${f.mimetype.startsWith('image/') ? 'images' : 'pdfs'}/${f.filename}`,
      filename: f.filename,
      originalName: f.originalname,
      size: f.size,
    }));
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.fullName,
      userEmail: req.user.email,
      userRole: 'admin',
      action: 'upload_multiple',
      resourceType: 'file',
      details: { files: files.map(f => ({ originalName: f.originalName, url: f.url })) },
      ipAddress: req.ip,
    });
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
