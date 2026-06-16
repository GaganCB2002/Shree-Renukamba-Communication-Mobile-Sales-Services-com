const { pool } = require('../config/db');
const PageVisit = require('../models/PageVisit');
const SearchQuery = require('../models/SearchQuery');

const trackVisit = async (req, res) => {
  try {
    await PageVisit.create({
      page: req.body.path || '/',
      user: req.user?._id,
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const totalRes = await pool.query('SELECT COUNT(*) as count FROM page_visits');
    const totalVisits = totalRes.rows[0]?.count || 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayRes = await pool.query(
      "SELECT COUNT(*) as count FROM page_visits WHERE timestamp >= $1",
      [todayStart.toISOString()]
    );
    const todayVisits = todayRes.rows[0]?.count || 0;

    const uniqueRes = await pool.query('SELECT COUNT(DISTINCT user_id) as count FROM page_visits');
    const uniqueVisitors = uniqueRes.rows[0]?.count || 0;

    const todayUniqueRes = await pool.query(
      "SELECT COUNT(DISTINCT user_id) as count FROM page_visits WHERE timestamp >= $1",
      [todayStart.toISOString()]
    );
    const todayUnique = todayUniqueRes.rows[0]?.count || 0;

    const topRes = await pool.query(
      'SELECT page, COUNT(*) as count FROM page_visits GROUP BY page ORDER BY count DESC LIMIT 10'
    );
    const topPages = topRes.rows;

    const recentRes = await pool.query('SELECT * FROM page_visits ORDER BY timestamp DESC LIMIT 20');
    const recentVisits = recentRes.rows;

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
    const queries = await SearchQuery.find({});
    res.json(queries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllSearchQueries = async (req, res) => {
  try {
    const queries = await SearchQuery.find({});
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
