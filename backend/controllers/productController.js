const Product = require('../models/Product');

/**
 * Product Controller
 */
const getProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll(req.query);
    res.json(products);
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product design not found' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
};

const updateStock = async (req, res, next) => {
  try {
    const { variantKey, stockQty } = req.body;
    if (!variantKey || stockQty === undefined) {
      return res.status(400).json({ error: 'variantKey and stockQty are required' });
    }
    const updated = await Product.updateStock(req.params.id, variantKey, stockQty);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, inventory: updated });
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const created = await Product.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProductById,
  updateStock,
  createProduct
};
