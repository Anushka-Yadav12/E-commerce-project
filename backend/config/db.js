const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, '..');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const dbPath = path.join(DB_DIR, 'ecommerce.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite3 database:', err.message);
  } else {
    console.log(`[Database] SQLite3 connected at: ${dbPath}`);
  }
});

// Promisified DB execution helpers
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Initialize SQLite tables
async function initSchema() {
  // 1. Products Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tagline TEXT,
      brand TEXT,
      category TEXT,
      gender TEXT,
      price REAL NOT NULL,
      original_price REAL,
      badge TEXT,
      is_new INTEGER DEFAULT 0,
      rating REAL DEFAULT 5.0,
      reviews_count INTEGER DEFAULT 0,
      description TEXT,
      details TEXT,
      care_instructions TEXT,
      sizes TEXT,
      colors TEXT,
      inventory TEXT
    )
  `);

  // 2. Orders Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS orders (
      order_id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      shipping_fee REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      total REAL NOT NULL,
      status TEXT DEFAULT 'Processing',
      tracking_number TEXT,
      created_at TEXT NOT NULL
    )
  `);

  // 3. Order Items Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      color TEXT,
      size TEXT,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      image TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(order_id)
    )
  `);

  // 4. Users Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      tier TEXT DEFAULT 'Atelier Privé Gold',
      points INTEGER DEFAULT 1450,
      preferred_size TEXT DEFAULT 'M',
      preferred_fit TEXT DEFAULT 'Relaxed Tailored',
      address TEXT,
      city TEXT,
      postal_code TEXT,
      avatar TEXT
    )
  `);
}

module.exports = {
  db,
  dbRun,
  dbAll,
  dbGet,
  initSchema
};
