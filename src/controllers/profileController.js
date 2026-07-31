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
    const userId = req.user.id;
    // Get current user's profile to determine gender and location
    const myProfile = ProfileModel.getByUserId(userId);
    
    const filters = {
      religion: req.query.religion,
      caste: req.query.caste,
      marital_status: req.query.marital_status,
      exclude_user_id: userId
    };

    if (myProfile) {
      // 1. Auto-assign opposite gender
      const myGender = myProfile.gender ? myProfile.gender.toLowerCase() : null;
      if (myGender === 'male') {
        filters.gender = 'Female';
      } else if (myGender === 'female') {
        filters.gender = 'Male';
      } else {
        filters.gender = req.query.gender; // fallback
      }

      // 2. Handle 'nearby' logic
      if (req.query.nearby === 'true' && myProfile.city) {
        filters.city = myProfile.city;
      } else {
        filters.country = req.query.country;
        filters.city = req.query.city;
      }
    } else {
      filters.gender = req.query.gender;
      filters.country = req.query.country;
      filters.city = req.query.city;
    }

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
