const db = require('../db');

class ChatModel {
  static sendMessage(senderId, receiverId, content) {
    // Verify connection is ACCEPTED before allowing chat
    const connection = db.prepare(`
      SELECT * FROM interests 
      WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
      AND status = 'ACCEPTED'
    `).get(senderId, receiverId, receiverId, senderId);

    if (!connection) {
      throw new Error('Messaging is allowed only between connected profiles with accepted interest');
    }

    const stmt = db.prepare(`
      INSERT INTO messages (sender_id, receiver_id, content)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(senderId, receiverId, content);
    return db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);
  }

  static getConversation(userId, targetUserId) {
    // Mark incoming messages as read
    db.prepare(`
      UPDATE messages SET is_read = 1 
      WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
    `).run(targetUserId, userId);

    return db.prepare(`
      SELECT * FROM messages
      WHERE (sender_id = ? AND receiver_id = ?)
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `).all(userId, targetUserId, targetUserId, userId);
  }

  static getRecentChats(userId) {
    return db.prepare(`
      SELECT 
        m1.*,
        p.full_name as partner_name,
        p.city as partner_city,
        (SELECT COUNT(*) FROM messages m2 WHERE m2.sender_id = p.user_id AND m2.receiver_id = ? AND m2.is_read = 0) as unread_count
      FROM messages m1
      JOIN (
        SELECT 
          CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as partner_id,
          MAX(id) as max_id
        FROM messages
        WHERE sender_id = ? OR receiver_id = ?
        GROUP BY partner_id
      ) latest ON m1.id = latest.max_id
      JOIN profiles p ON p.user_id = latest.partner_id
      ORDER BY m1.created_at DESC
    `).all(userId, userId, userId, userId);
  }
}

module.exports = ChatModel;
