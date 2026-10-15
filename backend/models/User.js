const { dbRun, dbGet } = require('../config/db');
const { SEED_USER } = require('../seed/seedData');

class User {
  static async seedIfEmpty() {
    const row = await dbGet('SELECT COUNT(*) as count FROM users');
    if (row.count === 0) {
      console.log('[User Model] Seeding default clientele profile into SQLite3...');
      await dbRun(`
        INSERT INTO users (
          id, full_name, email, phone, tier, points, preferred_size, preferred_fit,
          address, city, postal_code, avatar
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        SEED_USER.id,
        SEED_USER.full_name,
        SEED_USER.email,
        SEED_USER.phone,
        SEED_USER.tier,
        SEED_USER.points,
        SEED_USER.preferred_size,
        SEED_USER.preferred_fit,
        SEED_USER.address,
        SEED_USER.city,
        SEED_USER.postal_code,
        SEED_USER.avatar
      ]);
    }
  }

  static async findByEmail(email = 'elena.vance@example.com') {
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return await dbGet('SELECT * FROM users LIMIT 1');
    }
    return user;
  }

  static async update(data) {
    const email = data.email || 'elena.vance@example.com';
    await dbRun(`
      UPDATE users SET
        full_name = ?,
        phone = ?,
        preferred_size = ?,
        preferred_fit = ?,
        address = ?,
        city = ?,
        postal_code = ?
      WHERE email = ?
    `, [
      data.fullName || data.full_name,
      data.phone,
      data.preferredSize || data.preferred_size,
      data.preferredFit || data.preferred_fit,
      data.address,
      data.city,
      data.postalCode || data.postal_code,
      email
    ]);
    return await User.findByEmail(email);
  }
}

module.exports = User;
