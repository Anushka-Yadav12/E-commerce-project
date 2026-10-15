const { dbRun, dbAll, dbGet } = require('../config/db');
const { SEED_PRODUCTS } = require('../seed/seedData');

class Product {
  static format(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      tagline: row.tagline,
      brand: row.brand,
      category: row.category,
      gender: row.gender,
      price: row.price,
      originalPrice: row.original_price,
      badge: row.badge,
      isNew: Boolean(row.is_new),
      rating: row.rating,
      reviewsCount: row.reviews_count,
      description: row.description,
      details: row.details,
      careInstructions: JSON.parse(row.care_instructions || '[]'),
      sizes: JSON.parse(row.sizes || '[]'),
      colors: JSON.parse(row.colors || '[]'),
      inventory: JSON.parse(row.inventory || '{}')
    };
  }

  static async seedIfEmpty() {
    const row = await dbGet('SELECT COUNT(*) as count FROM products');
    if (row.count === 0) {
      console.log('[Product Model] Seeding initial apparel catalog into SQLite3...');
      for (const p of SEED_PRODUCTS) {
        await dbRun(`
          INSERT INTO products (
            id, name, tagline, brand, category, gender, price, original_price,
            badge, is_new, rating, reviews_count, description, details,
            care_instructions, sizes, colors, inventory
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          p.id,
          p.name,
          p.tagline,
          p.brand,
          p.category,
          p.gender,
          p.price,
          p.original_price,
          p.badge,
          p.is_new,
          p.rating,
          p.reviews_count,
          p.description,
          p.details,
          JSON.stringify(p.care_instructions),
          JSON.stringify(p.sizes),
          JSON.stringify(p.colors),
          JSON.stringify(p.inventory)
        ]);
      }
    }
  }

  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (filters.category && filters.category !== 'all') {
      sql += ' AND LOWER(category) = LOWER(?)';
      params.push(filters.category);
    }

    if (filters.gender && filters.gender !== 'all') {
      sql += ' AND (LOWER(gender) = LOWER(?) OR gender = "unisex")';
      params.push(filters.gender);
    }

    if (filters.search) {
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(description) LIKE ?)';
      const term = `%${filters.search.toLowerCase()}%`;
      params.push(term, term, term);
    }

    if (filters.maxPrice) {
      sql += ' AND price <= ?';
      params.push(parseFloat(filters.maxPrice));
    }

    if (filters.sort) {
      switch (filters.sort) {
        case 'price-asc':
          sql += ' ORDER BY price ASC';
          break;
        case 'price-desc':
          sql += ' ORDER BY price DESC';
          break;
        case 'rating':
          sql += ' ORDER BY rating DESC';
          break;
        case 'newest':
          sql += ' ORDER BY is_new DESC, id DESC';
          break;
        default:
          sql += ' ORDER BY id ASC';
          break;
      }
    }

    const rows = await dbAll(sql, params);
    let products = rows.map(Product.format);

    if (filters.size) {
      products = products.filter(p => p.sizes.includes(filters.size));
    }

    if (filters.inStockOnly === 'true' || filters.inStockOnly === true) {
      products = products.filter(p => {
        const total = Object.values(p.inventory || {}).reduce((sum, count) => sum + count, 0);
        return total > 0;
      });
    }

    return products;
  }

  static async findById(id) {
    const row = await dbGet('SELECT * FROM products WHERE id = ?', [id]);
    return Product.format(row);
  }

  static async updateStock(id, variantKey, stockQty) {
    const row = await dbGet('SELECT inventory FROM products WHERE id = ?', [id]);
    if (!row) return null;

    const inventory = JSON.parse(row.inventory || '{}');
    inventory[variantKey.toLowerCase()] = Math.max(0, parseInt(stockQty, 10) || 0);

    await dbRun('UPDATE products SET inventory = ? WHERE id = ?', [JSON.stringify(inventory), id]);
    return inventory;
  }

  static async create(data) {
    const id = data.id || 'prod-' + Date.now();
    await dbRun(`
      INSERT INTO products (
        id, name, tagline, brand, category, gender, price, original_price,
        badge, is_new, rating, reviews_count, description, details,
        care_instructions, sizes, colors, inventory
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      data.name,
      data.tagline || '',
      data.brand || 'ATELIER EDIT',
      data.category,
      data.gender || 'unisex',
      data.price,
      data.originalPrice || null,
      data.badge || 'NEW CAPSULE',
      data.isNew ? 1 : 0,
      5.0,
      0,
      data.description || '',
      data.details || '',
      JSON.stringify(data.careInstructions || []),
      JSON.stringify(data.sizes || ['S', 'M', 'L']),
      JSON.stringify(data.colors || []),
      JSON.stringify(data.inventory || {})
    ]);
    return await Product.findById(id);
  }
}

module.exports = Product;
