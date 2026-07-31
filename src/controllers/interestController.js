const InterestModel = require('../models/interestModel');

exports.sendInterest = (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiver_id, message } = req.body;
    if (!receiver_id) {
      return res.status(400).json({ error: 'receiver_id is required' });
    }
    const interest = InterestModel.sendInterest(senderId, receiver_id, message);
    res.status(201).json({ message: 'Interest expressed successfully', interest });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.respondToInterest = (req, res) => {
  try {
    const userId = req.user.id;
    const interestId = parseInt(req.params.interestId, 10);
    const { status } = req.body; // 'ACCEPTED', 'DECLINED', 'CANCELLED'

    if (!status) {
      return res.status(400).json({ error: 'status parameter is required' });
    }

    const interest = InterestModel.respondToInterest(interestId, userId, status);
    res.json({ message: `Interest request status updated to ${status}`, interest });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getReceivedInterests = (req, res) => {
  try {
    const userId = req.user.id;
    const interests = InterestModel.getReceivedInterests(userId);
    res.json({ count: interests.length, interests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSentInterests = (req, res) => {
  try {
    const userId = req.user.id;
    const interests = InterestModel.getSentInterests(userId);
    res.json({ count: interests.length, interests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getConnections = (req, res) => {
  try {
    const userId = req.user.id;
    const connections = InterestModel.getAcceptedConnections(userId);
    res.json({ count: connections.length, connections });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleShortlist = (req, res) => {
  try {
    const userId = req.user.id;
    const { target_user_id } = req.body;
    if (!target_user_id) {
      return res.status(400).json({ error: 'target_user_id is required' });
    }
    const result = InterestModel.toggleShortlist(userId, target_user_id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getShortlist = (req, res) => {
  try {
    const userId = req.user.id;
    const shortlist = InterestModel.getShortlist(userId);
    res.json({ count: shortlist.length, shortlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
