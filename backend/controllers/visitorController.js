const Visitor = require('../models/Visitor');

const trackVisitor = async (req, res) => {
  try {
    const { visitorId, page } = req.body;
    if (!page) {
      return res.status(400).json({ message: 'Page is required' });
    }

    const existing = visitorId ? await Visitor.findByVisitorId(visitorId) : null;

    const pageEntry = {
      page,
      timestamp: new Date().toISOString(),
      referrer: req.body.referrer || '',
    };

    const data = {
      visitorId: visitorId || undefined,
      ipAddress: req.ip || req.connection?.remoteAddress || '',
      userAgent: req.body.userAgent || '',
      browser: req.body.browser || '',
      os: req.body.os || '',
      deviceType: req.body.deviceType || '',
      screenResolution: req.body.screenResolution || '',
      language: req.body.language || '',
      timezone: req.body.timezone || '',
      referrer: req.body.referrer || '',
      pagesVisited: [pageEntry],
      consentGiven: req.body.consentGiven || false,
      firstVisit: existing ? undefined : new Date().toISOString(),
      lastVisit: new Date().toISOString(),
    };

    if (existing) {
      data.visitCount = existing.visitCount;
      if (req.body.consentGiven) {
        data.consentGiven = true;
      }
      const updated = await Visitor.update(existing.id, data);
      return res.json({ visitorId: updated.visitorId, isNew: false });
    } else {
      data.firstVisit = new Date().toISOString();
      const created = await Visitor.create(data);
      return res.json({ visitorId: created.visitorId, isNew: true });
    }
  } catch (error) {
    console.error('[Visitor Track] Error:', error.message);
    res.status(500).json({ message: 'Failed to track visitor' });
  }
};

const getVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.findAll(req.query);
    res.json(visitors);
  } catch (error) {
    console.error('[Visitors List] Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch visitors' });
  }
};

const getVisitorStats = async (req, res) => {
  try {
    const stats = await Visitor.getStats();
    res.json(stats);
  } catch (error) {
    console.error('[Visitor Stats] Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch visitor stats' });
  }
};

const getVisitorById = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }
    res.json(visitor);
  } catch (error) {
    console.error('[Visitor Detail] Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch visitor' });
  }
};

module.exports = {
  trackVisitor,
  getVisitors,
  getVisitorStats,
  getVisitorById,
};
