const User = require('../models/User');

/**
 * User Profile Controller
 */
const getProfile = async (req, res, next) => {
  try {
    const profile = await User.findByEmail(req.query.email);
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const updated = await User.update(req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile
};
