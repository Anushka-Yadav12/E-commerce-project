const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('./backend/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for local uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Serve local upload folder statically
app.use('/uploads', express.static(uploadDir));

// Serve decoupled frontend static assets
app.use(express.static(path.join(__dirname, 'frontend')));

// =========================================================================
// REST API ROUTES (Decoupled Backend Architecture)
// =========================================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    phase: 'Complete Decoupled Full-Stack',
    database: 'SQLite3 connected',
    storage: 'Local uploads active'
  });
});

// Get all products with filters & sorting
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.getProducts(req.query);
    res.json(products);
  } catch (err) {
    console.error('Error fetching products from SQLite3:', err);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

// Get single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Error fetching product by ID:', err);
    res.status(500).json({ error: 'Failed to retrieve product' });
  }
});

// Add new product (Admin)
app.post('/api/products', async (req, res) => {
  try {
    const created = await db.addProduct(req.body);
    res.status(201).json(created);
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update stock inventory for a product variant (Admin)
app.patch('/api/products/:id/stock', async (req, res) => {
  try {
    const { variantKey, stockQty } = req.body;
    if (!variantKey || stockQty === undefined) {
      return res.status(400).json({ error: 'variantKey and stockQty are required' });
    }
    const updatedInventory = await db.updateProductStock(req.params.id, variantKey, stockQty);
    if (!updatedInventory) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, inventory: updatedInventory });
  } catch (err) {
    console.error('Error updating stock in SQLite3:', err);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// Create customer order
app.post('/api/orders', async (req, res) => {
  try {
    const { customer, items, pricing } = req.body;
    if (!customer || !items || !pricing) {
      return res.status(400).json({ error: 'Incomplete order payload' });
    }
    const order = await db.createOrder(req.body);
    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating order in SQLite3:', err);
    res.status(500).json({ error: 'Failed to process order' });
  }
});

// Get all customer orders (Admin)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.getOrders();
    res.json(orders);
  } catch (err) {
    console.error('Error retrieving orders from SQLite3:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Local file upload endpoint for product imagery
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Fallback to index.html for client-side routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Initialize SQLite3 database and start server
db.initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` ATELIER VOGUE FULL-STACK APPLICATION RUNNING`);
      console.log(` URL: http://localhost:${PORT}`);
      console.log(` Database: SQLite3 (backend/ecommerce.sqlite)`);
      console.log(` Uploads: Local directory (/uploads)`);
      console.log(` Frontend: Decoupled client (/frontend)`);
      console.log(`====================================================`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize SQLite3 database:', err);
    process.exit(1);
  });
