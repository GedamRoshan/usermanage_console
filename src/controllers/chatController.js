const ChatModel = require('../models/chatModel');

exports.sendMessage = (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiver_id, content } = req.body;

    if (!receiver_id || !content) {
      return res.status(400).json({ error: 'receiver_id and content are required' });
    }

    const message = ChatModel.sendMessage(senderId, receiver_id, content);
    res.status(201).json({ message: 'Message sent', data: message });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getConversation = (req, res) => {
  try {
    const userId = req.user.id;
    const targetUserId = parseInt(req.params.targetUserId, 10);

    const messages = ChatModel.getConversation(userId, targetUserId);
    res.json({ count: messages.length, messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecentChats = (req, res) => {
  try {
    const userId = req.user.id;
    const chats = ChatModel.getRecentChats(userId);
    res.json({ chats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
