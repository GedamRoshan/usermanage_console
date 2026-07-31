const db = require('../db');

class AdminModel {
  static getDashboardMetrics() {
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'USER'").get().count;
    const activeUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'ACTIVE' AND role = 'USER'").get().count;
    const totalProfiles = db.prepare("SELECT COUNT(*) as count FROM profiles").get().count;
    const pendingInterests = db.prepare("SELECT COUNT(*) as count FROM interests WHERE status = 'PENDING'").get().count;
    const acceptedConnections = db.prepare("SELECT COUNT(*) as count FROM interests WHERE status = 'ACCEPTED'").get().count;
    const openReports = db.prepare("SELECT COUNT(*) as count FROM reports WHERE status = 'OPEN'").get().count;


    return {
      totalUsers,
      activeUsers,
      totalProfiles,
      pendingInterests,
      acceptedConnections,
      openReports
    };
  }

  static getAllUsers(limit = 100, offset = 0) {
    return db.prepare(`
      SELECT u.id, u.email, u.phone, u.name, u.role, u.status, u.created_at, p.full_name, p.gender, p.city, p.is_verified
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);
  }

  static updateUserStatus(userId, status) {
    const validStatuses = ['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }
    db.prepare('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, userId);
    return db.prepare('SELECT id, email, name, role, status FROM users WHERE id = ?').get(userId);
  }

  static verifyProfile(userId, isVerified) {
    db.prepare('UPDATE profiles SET is_verified = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?')
      .run(isVerified ? 1 : 0, userId);
    return db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);
  }

  static reportUser(reporterId, reportedUserId, reason) {
    if (reporterId === reportedUserId) {
      throw new Error('Cannot report yourself');
    }
    const stmt = db.prepare(`
      INSERT INTO reports (reporter_id, reported_user_id, reason)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(reporterId, reportedUserId, reason);
    return db.prepare('SELECT * FROM reports WHERE id = ?').get(result.lastInsertRowid);
  }

  static getReports() {
    return db.prepare(`
      SELECT r.*,
        u1.email as reporter_email, p1.full_name as reporter_name,
        u2.email as reported_email, p2.full_name as reported_name
      FROM reports r
      LEFT JOIN users u1 ON r.reporter_id = u1.id
      LEFT JOIN profiles p1 ON r.reporter_id = p1.user_id
      LEFT JOIN users u2 ON r.reported_user_id = u2.id
      LEFT JOIN profiles p2 ON r.reported_user_id = p2.user_id
      ORDER BY r.created_at DESC
    `).all();
  }

  static updateReportStatus(reportId, status) {
    const validStatuses = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid report status');
    }
    db.prepare('UPDATE reports SET status = ? WHERE id = ?').run(status, reportId);
    return db.prepare('SELECT * FROM reports WHERE id = ?').get(reportId);
  }
}

module.exports = AdminModel;
