const express = require('express');
const path = require('path');
const fs = require('fs');

// Config & Database
const { initSchema } = require('./backend/config/db');
const Product = require('./backend/models/Product');
const User = require('./backend/models/User');

// Middleware
const requestLogger = require('./backend/middleware/requestLogger');
const errorHandler = require('./backend/middleware/errorHandler');

// Modular Routes
const productRoutes = require('./backend/routes/productRoutes');
const orderRoutes = require('./backend/routes/orderRoutes');
const userRoutes = require('./backend/routes/userRoutes');
const uploadRoutes = require('./backend/routes/uploadRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Body Parsers & Request Logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Static Asset Serving (Decoupled Frontend & Local Uploads)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));
app.use(express.static(path.join(__dirname, 'frontend')));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    phase: 'Modular Production-Grade Backend',
    database: 'SQLite3 connected',
    storage: 'Local folder (/uploads)'
  });
});

// Mount Modular REST API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);
app.use('/api/upload', uploadRoutes);

// Centralized Error Handler (API Errors)
app.use(errorHandler);

// Fallback to index.html for decoupled client-side routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Initialize Database & Start Server
async function startServer() {
  try {
    await initSchema();
    await Product.seedIfEmpty();
    await User.seedIfEmpty();

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` ATELIER VOGUE MODULAR BACKEND SERVER ACTIVE`);
      console.log(` URL: http://localhost:${PORT}`);
      console.log(` Architecture: Decoupled REST API + Frontend Client`);
      console.log(` Database: SQLite3 (backend/ecommerce.sqlite)`);
      console.log(` Uploads Folder: /uploads`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Fatal: Failed to start backend server:', err);
    process.exit(1);
  }
}

startServer();
