const cron = require('node-cron');
const { pool } = require('../config/db');
const Notification = require('../models/Notification');

const generateId = () => {
  const t = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const m = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const p = Math.floor(Math.random() * 65535).toString(16).padStart(4, '0');
  const i = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  return (t + m + p + i).substring(0, 24);
};

const createReminderNotification = async (userId, repairId, customerName, issueDescription, deliveryDate) => {
  const title = 'Delivery Reminder';
  const message = `You have to deliver the order today itself. Customer: ${customerName}, Issue: ${issueDescription}, Repair: ${repairId}`;
  await Notification.create({
    userId,
    title,
    message,
    type: 'delivery_reminder',
  });
};

const createUserNotification = async (userId, repairId, message) => {
  await Notification.create({
    userId,
    title: 'Delivery Update',
    message,
    type: 'delivery_update',
  });
};

const checkDeliveryReminders = async () => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const res = await pool.query(`
      SELECT ro.id, ro.repair_id, ro.issue_description, ro.expected_delivery_date,
             ro.customer_id, c.user_id AS customer_user_id,
             u.full_name AS customer_name, u.email AS customer_email
      FROM repair_orders ro
      JOIN customers c ON c.id = ro.customer_id
      JOIN users u ON u.id = c.user_id
      WHERE ro.repair_status NOT IN ('Delivered', 'Cancelled')
        AND ro.expected_delivery_date IS NOT NULL
        AND ro.expected_delivery_date >= $1
        AND ro.expected_delivery_date < $2
    `, [todayStart.toISOString(), todayEnd.toISOString()]);

    for (const row of res.rows) {
      await createReminderNotification(
        row.customer_user_id,
        row.repair_id,
        row.customer_name,
        row.issue_description || 'General repair',
        row.expected_delivery_date
      );

      const adminRes = await pool.query("SELECT id FROM users WHERE role = 'admin'");
      for (const admin of adminRes.rows) {
        await createReminderNotification(
          admin.id,
          row.repair_id,
          row.customer_name,
          row.issue_description || 'General repair',
          row.expected_delivery_date
        );
      }
    }

    if (res.rows.length > 0) {
      console.log(`[Reminder] Created ${res.rows.length * 2} delivery reminder notifications`);
    }
  } catch (err) {
    console.error('[Reminder] Error checking delivery reminders:', err.message);
  }
};

let intervalId = null;

const startReminderService = () => {
  console.log('[Reminder] Starting delivery reminder service (every 30 min)...');
  checkDeliveryReminders();
  intervalId = setInterval(checkDeliveryReminders, 30 * 60 * 1000);
};

const stopReminderService = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[Reminder] Stopped delivery reminder service');
  }
};

module.exports = { startReminderService, stopReminderService, checkDeliveryReminders };
