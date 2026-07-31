const AdminModel = require('../models/adminModel');

exports.getMetrics = (req, res) => {
  try {
    const metrics = AdminModel.getDashboardMetrics();
    res.json({ metrics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUsersList = (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = parseInt(req.query.offset, 10) || 0;
    const users = AdminModel.getAllUsers(limit, offset);
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUserStatus = (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const { status } = req.body;
    const user = AdminModel.updateUserStatus(userId, status);
    res.json({ message: 'User status updated', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.verifyProfile = (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const { is_verified } = req.body;
    const profile = AdminModel.verifyProfile(userId, is_verified);
    res.json({ message: 'Profile verification status updated', profile });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.reportUser = (req, res) => {
  try {
    const reporterId = req.user.id;
    const { reported_user_id, reason } = req.body;
    if (!reported_user_id || !reason) {
      return res.status(400).json({ error: 'reported_user_id and reason are required' });
    }
    const report = AdminModel.reportUser(reporterId, reported_user_id, reason);
    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getReports = (req, res) => {
  try {
    const reports = AdminModel.getReports();
    res.json({ count: reports.length, reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateReportStatus = (req, res) => {
  try {
    const reportId = parseInt(req.params.reportId, 10);
    const { status } = req.body;
    const report = AdminModel.updateReportStatus(reportId, status);
    res.json({ message: 'Report status updated', report });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
