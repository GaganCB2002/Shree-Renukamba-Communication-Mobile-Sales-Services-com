const PageVisit = require('../models/PageVisit');
const SearchQuery = require('../models/SearchQuery');

const trackVisit = async (req, res) => {
  try {
    await PageVisit.create({
      path: req.body.path || '/',
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      referrer: req.headers['referer'] || '',
      user: req.user?._id,
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const totalVisits = await PageVisit.countDocuments();
    const todayVisits = await PageVisit.countDocuments({
      visitedAt: { $gte: new Date().setHours(0, 0, 0, 0) },
    });
    const uniqueVisitors = await PageVisit.distinct('ip').then(ips => ips.length);
    const todayUnique = await PageVisit.distinct('ip', {
      visitedAt: { $gte: new Date().setHours(0, 0, 0, 0) },
    }).then(ips => ips.length);

    const topPages = await PageVisit.aggregate([
      { $group: { _id: '$path', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const recentVisits = await PageVisit.find({})
      .populate('user', 'fullName email')
      .sort({ visitedAt: -1 })
      .limit(20);

    res.json({
      totalVisits,
      todayVisits,
      uniqueVisitors,
      todayUnique,
      topPages,
      recentVisits,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSearchQueries = async (req, res) => {
  try {
    const queries = await SearchQuery.find({ found: false })
      .populate('user', 'fullName email')
      .sort({ searchedAt: -1 });
    res.json(queries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllSearchQueries = async (req, res) => {
  try {
    const queries = await SearchQuery.find({})
      .populate('user', 'fullName email')
      .sort({ searchedAt: -1 })
      .limit(100);
    res.json(queries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const saveSearchQuery = async (req, res) => {
  try {
    const { query, resultsCount } = req.body;
    const search = await SearchQuery.create({
      query,
      user: req.user?._id,
      resultsCount: resultsCount || 0,
      found: (resultsCount || 0) > 0,
    });
    res.json(search);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  trackVisit,
  getAnalytics,
  getSearchQueries,
  getAllSearchQueries,
  saveSearchQuery,
};
