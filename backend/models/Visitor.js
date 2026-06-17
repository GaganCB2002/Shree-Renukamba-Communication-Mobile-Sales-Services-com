const { pool } = require('../config/db');

const generateId = () => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
  const machine = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const pid = Math.floor(Math.random() * 65535).toString(16).padStart(4, '0');
  const increment = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  return (timestamp + machine + pid + increment).substring(0, 24);
};

class VisitorInstance {
  constructor(row) {
    if (!row) return;
    this.id = row.id;
    this.visitorId = row.visitor_id;
    this.ipAddress = row.ip_address;
    this.userAgent = row.user_agent;
    this.browser = row.browser;
    this.os = row.os;
    this.deviceType = row.device_type;
    this.screenResolution = row.screen_resolution;
    this.language = row.language;
    this.timezone = row.timezone;
    this.referrer = row.referrer;
    this.pagesVisited = (() => { try { return JSON.parse(row.pages_visited || '[]'); } catch { return []; } })();
    this.consentGiven = !!row.consent_given;
    this.visitCount = row.visit_count;
    this.firstVisit = row.first_visit;
    this.lastVisit = row.last_visit;
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }
}

class Visitor {
  static async create(data) {
    const id = generateId();
    const now = new Date().toISOString();
    const sql = `
      INSERT INTO visitors (id, visitor_id, ip_address, user_agent, browser, os, device_type, screen_resolution, language, timezone, referrer, pages_visited, consent_given, visit_count, first_visit, last_visit, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;
    const vals = [
      id,
      data.visitorId || id,
      data.ipAddress || '',
      data.userAgent || '',
      data.browser || '',
      data.os || '',
      data.deviceType || '',
      data.screenResolution || '',
      data.language || '',
      data.timezone || '',
      data.referrer || '',
      JSON.stringify(data.pagesVisited || []),
      data.consentGiven ? 1 : 0,
      data.visitCount || 1,
      data.firstVisit || now,
      data.lastVisit || now,
      now,
      now,
    ];
    const res = await pool.query(sql, vals);
    return new VisitorInstance(res.rows[0]);
  }

  static async findByVisitorId(visitorId) {
    const res = await pool.query('SELECT * FROM visitors WHERE visitor_id = $1', [visitorId]);
    if (res.rows.length === 0) return null;
    return new VisitorInstance(res.rows[0]);
  }

  static async update(id, data) {
    const now = new Date().toISOString();
    const existing = await pool.query('SELECT * FROM visitors WHERE id = $1', [id]);
    if (existing.rows.length === 0) return null;
    const current = existing.rows[0];

    const currentPages = (() => { try { return JSON.parse(current.pages_visited || '[]'); } catch { return []; } })();
    const newPages = data.pagesVisited || [];
    const mergedPages = [...currentPages];
    for (const p of newPages) {
      if (!mergedPages.some(m => m.page === p.page && m.timestamp === p.timestamp)) {
        mergedPages.push(p);
      }
    }

    const sql = `
      UPDATE visitors SET
        ip_address = $1, user_agent = $2, browser = $3, os = $4,
        device_type = $5, screen_resolution = $6, language = $7,
        timezone = $8, referrer = $9, pages_visited = $10,
        consent_given = $11, visit_count = $12, last_visit = $13, updated_at = $14
      WHERE id = $15 RETURNING *
    `;
    const vals = [
      data.ipAddress || current.ip_address,
      data.userAgent || current.user_agent,
      data.browser || current.browser,
      data.os || current.os,
      data.deviceType || current.device_type,
      data.screenResolution || current.screen_resolution,
      data.language || current.language,
      data.timezone || current.timezone,
      data.referrer || current.referrer,
      JSON.stringify(mergedPages),
      data.consentGiven !== undefined ? (data.consentGiven ? 1 : 0) : current.consent_given,
      current.visit_count + 1,
      now,
      id,
    ];
    const res = await pool.query(sql, vals);
    return new VisitorInstance(res.rows[0]);
  }

  static async findAll(query = {}) {
    let sql = 'SELECT * FROM visitors';
    let vals = [];
    let conditions = [];
    if (query.consentGiven !== undefined) {
      conditions.push(`consent_given = $${vals.length + 1}`);
      vals.push(query.consentGiven ? 1 : 0);
    }
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY last_visit DESC';
    const res = await pool.query(sql, vals);
    return res.rows.map(r => new VisitorInstance(r));
  }

  static async getStats() {
    const totalRes = await pool.query('SELECT COUNT(*) as count FROM visitors');
    const total = totalRes.rows[0]?.count || 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayRes = await pool.query(
      "SELECT COUNT(*) as count FROM visitors WHERE last_visit >= $1",
      [todayStart.toISOString()]
    );
    const today = todayRes.rows[0]?.count || 0;

    const onlineRes = await pool.query(
      "SELECT COUNT(*) as count FROM visitors WHERE last_visit >= $1",
      [new Date(Date.now() - 5 * 60 * 1000).toISOString()]
    );
    const online = onlineRes.rows[0]?.count || 0;

    const consentedRes = await pool.query(
      "SELECT COUNT(*) as count FROM visitors WHERE consent_given = 1"
    );
    const consented = consentedRes.rows[0]?.count || 0;

    const browserRes = await pool.query(
      "SELECT browser, COUNT(*) as count FROM visitors WHERE browser != '' GROUP BY browser ORDER BY count DESC"
    );
    const browsers = browserRes.rows;

    const osRes = await pool.query(
      "SELECT os, COUNT(*) as count FROM visitors WHERE os != '' GROUP BY os ORDER BY count DESC"
    );
    const oss = osRes.rows;

    const deviceRes = await pool.query(
      "SELECT device_type, COUNT(*) as count FROM visitors WHERE device_type != '' GROUP BY device_type ORDER BY count DESC"
    );
    const devices = deviceRes.rows;

    return { total, today, online, consented, browsers, oss, devices };
  }

  static async findById(id) {
    const res = await pool.query('SELECT * FROM visitors WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return new VisitorInstance(res.rows[0]);
  }
}

module.exports = Visitor;
