const db = require('../db');

class InterestModel {
  static sendInterest(senderId, receiverId, message = '') {
    if (senderId === receiverId) {
      throw new Error('Cannot send interest to yourself');
    }

    const existing = db.prepare(`
      SELECT * FROM interests WHERE sender_id = ? AND receiver_id = ?
    `).get(senderId, receiverId);

    if (existing) {
      return existing;
    }

    const stmt = db.prepare(`
      INSERT INTO interests (sender_id, receiver_id, status, message)
      VALUES (?, ?, 'PENDING', ?)
    `);
    const result = stmt.run(senderId, receiverId, message);
    return db.prepare('SELECT * FROM interests WHERE id = ?').get(result.lastInsertRowid);
  }

  static respondToInterest(interestId, receiverId, status) {
    const validStatuses = ['ACCEPTED', 'DECLINED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status provided');
    }

    const interest = db.prepare('SELECT * FROM interests WHERE id = ?').get(interestId);
    if (!interest) {
      throw new Error('Interest request not found');
    }

    if (status === 'ACCEPTED' || status === 'DECLINED') {
      if (interest.receiver_id !== receiverId) {
        throw new Error('Unauthorized to respond to this interest request');
      }
    } else if (status === 'CANCELLED') {
      if (interest.sender_id !== receiverId) {
        throw new Error('Unauthorized to cancel this interest request');
      }
    }

    db.prepare(`
      UPDATE interests
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, interestId);

    return db.prepare('SELECT * FROM interests WHERE id = ?').get(interestId);
  }

  static getReceivedInterests(userId) {
    return db.prepare(`
      SELECT i.*, p.full_name as sender_name, p.gender as sender_gender, p.city as sender_city, p.photo_privacy
      FROM interests i
      LEFT JOIN profiles p ON i.sender_id = p.user_id
      WHERE i.receiver_id = ?
      ORDER BY i.created_at DESC
    `).all(userId);
  }

  static getSentInterests(userId) {
    return db.prepare(`
      SELECT i.*, p.full_name as receiver_name, p.gender as receiver_gender, p.city as receiver_city, p.photo_privacy
      FROM interests i
      LEFT JOIN profiles p ON i.receiver_id = p.user_id
      WHERE i.sender_id = ?
      ORDER BY i.created_at DESC
    `).all(userId);
  }

  static getAcceptedConnections(userId) {
    return db.prepare(`
      SELECT i.*, 
        CASE 
          WHEN i.sender_id = ? THEN i.receiver_id 
          ELSE i.sender_id 
        END as connected_user_id,
        p.full_name as connected_user_name,
        p.city as connected_user_city
      FROM interests i
      LEFT JOIN profiles p ON p.user_id = (CASE WHEN i.sender_id = ? THEN i.receiver_id ELSE i.sender_id END)
      WHERE (i.sender_id = ? OR i.receiver_id = ?) AND i.status = 'ACCEPTED'
      ORDER BY i.updated_at DESC
    `).all(userId, userId, userId, userId);
  }

  static toggleShortlist(userId, targetUserId) {
    const existing = db.prepare(`
      SELECT * FROM shortlists WHERE user_id = ? AND shortlisted_user_id = ?
    `).get(userId, targetUserId);

    if (existing) {
      db.prepare('DELETE FROM shortlists WHERE id = ?').run(existing.id);
      return { shortlisted: false };
    } else {
      db.prepare('INSERT INTO shortlists (user_id, shortlisted_user_id) VALUES (?, ?)').run(userId, targetUserId);
      return { shortlisted: true };
    }
  }

  static getShortlist(userId) {
    return db.prepare(`
      SELECT s.*, p.full_name, p.gender, p.city, p.occupation, p.highest_education
      FROM shortlists s
      LEFT JOIN profiles p ON s.shortlisted_user_id = p.user_id
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC
    `).all(userId);
  }
}

module.exports = InterestModel;
