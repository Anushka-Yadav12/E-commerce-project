const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.patch('/:id/stock', productController.updateStock);
router.post('/', productController.createProduct);

module.exports = router;
