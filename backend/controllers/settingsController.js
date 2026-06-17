const Settings = require('../models/Settings');

const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getAll();
    const result = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ message: 'Key and value are required' });
    }
    const allowedKeys = ['cancel_repair_hours', 'cancel_order_hours'];
    if (!allowedKeys.includes(key)) {
      return res.status(400).json({ message: 'Invalid setting key' });
    }
    const hours = parseInt(value, 10);
    if (isNaN(hours) || hours < 1) {
      return res.status(400).json({ message: 'Value must be a positive number' });
    }
    await Settings.set(key, hours);
    res.json({ message: 'Setting updated', key, value: hours });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSetting };