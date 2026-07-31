const db = require('../db');

class ProfileModel {
  static createOrUpdateProfile(userId, profileData) {
    const existing = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(userId);
    const {
      profile_created_for,
      full_name,
      gender,
      dob,
      height_cm,
      weight,
      marital_status,
      mother_tongue,
      religion,
      caste,
      sub_caste,
      gothram,
      manglik,
      highest_education,
      occupation,
      company,
      designation,
      annual_income,
      experience,
      country,
      state,
      city,
      pincode,
      current_address,
      live_location_enabled,
      work_location,
      about_me,
      diet,
      smoking,
      drinking,
      exercise,
      photos,
      photo_privacy
    } = profileData;

    // Convert photos array to JSON string for SQLite storage
    const photosJson = photos ? JSON.stringify(photos) : null;
    const liveLoc = live_location_enabled ? 1 : 0;

    if (existing) {
      const stmt = db.prepare(`
        UPDATE profiles SET
          profile_created_for = COALESCE(?, profile_created_for),
          full_name = COALESCE(?, full_name),
          gender = COALESCE(?, gender),
          dob = COALESCE(?, dob),
          height_cm = COALESCE(?, height_cm),
          weight = COALESCE(?, weight),
          marital_status = COALESCE(?, marital_status),
          mother_tongue = COALESCE(?, mother_tongue),
          religion = COALESCE(?, religion),
          caste = COALESCE(?, caste),
          sub_caste = COALESCE(?, sub_caste),
          gothram = COALESCE(?, gothram),
          manglik = COALESCE(?, manglik),
          highest_education = COALESCE(?, highest_education),
          occupation = COALESCE(?, occupation),
          company = COALESCE(?, company),
          designation = COALESCE(?, designation),
          annual_income = COALESCE(?, annual_income),
          experience = COALESCE(?, experience),
          country = COALESCE(?, country),
          state = COALESCE(?, state),
          city = COALESCE(?, city),
          pincode = COALESCE(?, pincode),
          current_address = COALESCE(?, current_address),
          live_location_enabled = COALESCE(?, live_location_enabled),
          work_location = COALESCE(?, work_location),
          about_me = COALESCE(?, about_me),
          diet = COALESCE(?, diet),
          smoking = COALESCE(?, smoking),
          drinking = COALESCE(?, drinking),
          exercise = COALESCE(?, exercise),
          photos = COALESCE(?, photos),
          photo_privacy = COALESCE(?, photo_privacy),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `);
      stmt.run(
        profile_created_for, full_name, gender, dob, height_cm, weight,
        marital_status, mother_tongue, religion, caste, sub_caste, gothram,
        manglik, highest_education, occupation, company, designation,
        annual_income, experience, country, state, city, pincode,
        current_address, live_location_enabled !== undefined ? liveLoc : null,
        work_location, about_me, diet, smoking, drinking, exercise,
        photosJson, photo_privacy, userId
      );
      return this.getByUserId(userId);
    } else {
      const stmt = db.prepare(`
        INSERT INTO profiles (
          user_id, profile_created_for, full_name, gender, dob, height_cm, weight,
          marital_status, mother_tongue, religion, caste, sub_caste, gothram,
          manglik, highest_education, occupation, company, designation,
          annual_income, experience, country, state, city, pincode,
          current_address, live_location_enabled, work_location, about_me,
          diet, smoking, drinking, exercise, photos, photo_privacy
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);
      stmt.run(
        userId, profile_created_for, full_name, gender, dob, height_cm, weight,
        marital_status, mother_tongue, religion, caste, sub_caste, gothram,
        manglik, highest_education, occupation, company, designation,
        annual_income, experience, country, state, city, pincode,
        current_address, liveLoc, work_location, about_me,
        diet, smoking, drinking, exercise, photosJson, photo_privacy || 'PUBLIC'
      );
      return this.getByUserId(userId);
    }
  }

  static getByUserId(userId) {
    const profile = db.prepare(`
      SELECT p.*, u.email, u.phone, u.status as user_status
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
    `).get(userId);

    if (profile && profile.photos) {
      try {
        profile.photos = JSON.parse(profile.photos);
      } catch(e) {
        profile.photos = [];
      }
    }
    return profile;
  }

  static searchProfiles(filters = {}) {
    let query = `
      SELECT p.*, u.email, u.status as user_status
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      WHERE u.status = 'ACTIVE'
    `;
    const params = [];

    if (filters.gender) {
      query += ` AND p.gender = ?`;
      params.push(filters.gender);
    }
    if (filters.religion) {
      query += ` AND p.religion = ?`;
      params.push(filters.religion);
    }
    if (filters.caste) {
      query += ` AND p.caste = ?`;
      params.push(filters.caste);
    }
    if (filters.marital_status) {
      query += ` AND p.marital_status = ?`;
      params.push(filters.marital_status);
    }
    if (filters.country) {
      query += ` AND p.country = ?`;
      params.push(filters.country);
    }
    if (filters.city) {
      query += ` AND p.city = ?`;
      params.push(filters.city);
    }
    if (filters.exclude_user_id) {
      query += ` AND p.user_id != ?`;
      params.push(filters.exclude_user_id);
    }

    query += ` ORDER BY p.created_at DESC LIMIT 50`;
    const profiles = db.prepare(query).all(...params);

    return profiles.map(p => {
      if (p.photos) {
        try { p.photos = JSON.parse(p.photos); } catch(e) { p.photos = []; }
      }
      return p;
    });
  }

  static setPreferences(userId, prefData) {
    const existing = db.prepare('SELECT id FROM partner_preferences WHERE user_id = ?').get(userId);
    const {
      min_age, max_age, min_height_cm, max_height_cm,
      preferred_religions, preferred_castes, preferred_education,
      preferred_income, preferred_countries
    } = prefData;

    if (existing) {
      const stmt = db.prepare(`
        UPDATE partner_preferences SET
          min_age = COALESCE(?, min_age),
          max_age = COALESCE(?, max_age),
          min_height_cm = COALESCE(?, min_height_cm),
          max_height_cm = COALESCE(?, max_height_cm),
          preferred_religions = COALESCE(?, preferred_religions),
          preferred_castes = COALESCE(?, preferred_castes),
          preferred_education = COALESCE(?, preferred_education),
          preferred_income = COALESCE(?, preferred_income),
          preferred_countries = COALESCE(?, preferred_countries)
        WHERE user_id = ?
      `);
      stmt.run(
        min_age, max_age, min_height_cm, max_height_cm,
        preferred_religions, preferred_castes, preferred_education,
        preferred_income, preferred_countries, userId
      );
    } else {
      const stmt = db.prepare(`
        INSERT INTO partner_preferences (
          user_id, min_age, max_age, min_height_cm, max_height_cm,
          preferred_religions, preferred_castes, preferred_education,
          preferred_income, preferred_countries
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        userId, min_age, max_age, min_height_cm, max_height_cm,
        preferred_religions, preferred_castes, preferred_education,
        preferred_income, preferred_countries
      );
    }
    return db.prepare('SELECT * FROM partner_preferences WHERE user_id = ?').get(userId);
  }

  static getPreferences(userId) {
    return db.prepare('SELECT * FROM partner_preferences WHERE user_id = ?').get(userId);
  }
}

module.exports = ProfileModel;
