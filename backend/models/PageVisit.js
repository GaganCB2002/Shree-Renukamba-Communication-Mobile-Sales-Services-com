const mongoose = require('mongoose');

const pageVisitSchema = new mongoose.Schema({
  path: { type: String, required: true },
  ip: { type: String },
  userAgent: { type: String },
  referrer: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  visitedAt: { type: Date, default: Date.now },
});

pageVisitSchema.index({ visitedAt: -1 });

const PageVisit = mongoose.model('PageVisit', pageVisitSchema);
module.exports = PageVisit;
