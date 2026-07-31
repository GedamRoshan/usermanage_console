const ProfileModel = require('../models/profileModel');

exports.upsertProfile = (req, res) => {
  try {
    const userId = req.user.id;
    const profile = ProfileModel.createOrUpdateProfile(userId, req.body);
    res.json({ message: 'Profile saved successfully', profile });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getMyProfile = (req, res) => {
  try {
    const userId = req.user.id;
    const profile = ProfileModel.getByUserId(userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found. Please create a profile.' });
    }
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProfileById = (req, res) => {
  try {
    const targetUserId = parseInt(req.params.userId, 10);
    const profile = ProfileModel.getByUserId(targetUserId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    // Apply photo privacy rules if blurred
    if (profile.photo_privacy === 'BLURRED' && profile.user_id !== req.user.id) {
      profile.photo_url_masked = true;
    }
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchProfiles = (req, res) => {
  try {
    const filters = {
      gender: req.query.gender,
      religion: req.query.religion,
      caste: req.query.caste,
      marital_status: req.query.marital_status,
      country: req.query.country,
      city: req.query.city,
      exclude_user_id: req.user.id
    };
    const profiles = ProfileModel.searchProfiles(filters);
    res.json({ count: profiles.length, profiles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.upsertPreferences = (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = ProfileModel.setPreferences(userId, req.body);
    res.json({ message: 'Partner preferences saved', preferences });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getPreferences = (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = ProfileModel.getPreferences(userId);
    res.json({ preferences: preferences || {} });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
