# ATELIER VOGUE — Contemporary Clothing E-Commerce Web Application

A modern, high-converting clothing e-commerce web platform architected with a **decoupled architecture**, built using pure **HTML5, Bootstrap 5 CSS + Custom Luxury Design System, Vanilla JavaScript**, and a **Node.js + Express.js backend** with **SQLite3 database** and **local file storage**.

---

## 🏛️ System Architecture

The application adopts a clean **Decoupled Architecture**:

```
anushka yadav/
├── frontend/                     # Decoupled Frontend Client Layer
│   ├── index.html                # Semantic HTML5 Layout & Drawers/Modals
│   ├── css/
│   │   └── style.css             # Atelier Luxury Design System (Tokens, Glassmorphism, Animations)
│   └── js/
│       ├── mockData.js           # Apparel seed catalog & promotion fixtures
│       ├── api.js                # Decoupled API abstraction (switches between REST API & Client Store)
│       ├── store.js              # Centralized reactive Pub/Sub state store with LocalStorage sync
│       ├── ui.js                 # DOM renderers (Catalog grid, PDP modal, Drawers, Checkout, Admin)
│       └── app.js                # Event orchestrator, debounce search, filter listeners
├── backend/                      # Backend API & Database Layer
│   ├── database.js               # SQLite3 database schema, seeding & queries
│   └── ecommerce.sqlite          # Relational SQLite3 database
├── uploads/                      # Local upload folder for product photography (Multer)
├── server.js                     # Express.js REST API server & static asset host
└── package.json                  # Dependencies & execution scripts
```

---

## 🚀 Key Features

### 1. Storefront & Visual Experience
- **Editorial Fashion Design System:** Google Fonts (`Playfair Display` & `Plus Jakarta Sans`), obsidian dark aesthetics (`#0a0c0f`), warm champagne gold accents (`#e0a96d`), and glassmorphic cards.
- **Top Promotional Bar:** Announcement ticker with promotional code (`LUXE20`).
- **Sticky Navigation:** Real-time debounced search, Wishlist counter, Shopping Bag counter, and Merchant Admin portal switcher.
- **Hero Lookbook Section:** High-impact editorial hero with capsule tag and direct CTAs.
- **Brand Value Bar:** Highlights express delivery, bespoke packaging, 30-day returns, and traceable fabrics.

### 2. Interactive Product Catalog & Filtering
- **Category Filter Pills:** All Styles, Outerwear, Knitwear, Tops & Tees, Trousers & Denim, Accessories.
- **Sorting Options:** Featured, New Arrivals, Price: Low to High, Price: High to Low, Highest Rated.
- **Slide-Out Refine Drawer:** Filter by gender (Women, Men, Unisex), price range slider ($40–$350), and in-stock only toggle.
- **Dynamic Cards:** Real-time badges (*BESTSELLER, NEW DROP, SALE 20%*), wishlist heart toggle, and interactive color dot swatches that switch thumbnails on the card.

### 3. Product Detail Modal (PDP) & Sizing Guide
- **Multi-Image Showcase:** High-resolution zoomable gallery with thumbnail switcher.
- **Variant Selector:** Interactive color swatches and size selection pills (XS–XXL) with real-time stock indicators.
- **Sizing & Fit Advisor:** Comprehensive dimension chart (Chest, Waist, Sleeve in inches & cm) with recommendations.
- **Garment Accordion:** Detailed specs, fabric origin, GSM weight, and care instructions.

### 4. Slide-Out Shopping Bag
- **Free Shipping Progress Bar:** Live calculation towards complimentary shipping threshold ($150).
- **Cart Management:** Quantity modifier, variant details, item deletion, and coupon validator (`LUXE20`, `WELCOME10`, `FREESHIP`).
- **Order Summary:** Real-time calculation of Subtotal, Discount, Shipping, Tax (8%), and Total.

### 5. Multi-Step Checkout & Fulfillment
- **Step 1:** Shipping destination capture (Customer Name, Email, Address, Postal Code).
- **Step 2:** Delivery method selection (Complimentary Atelier Delivery vs $15 Priority Express).
- **Step 3:** Card payment simulation with secure credentials input.
- **Order Confirmation:** Generated Order ID (`#ORD-XXXXXX`), tracking number, and interactive 4-stage fulfillment timeline.

### 6. Merchant Admin & Local File Uploads
- **Operations Dashboard:** Live metrics for Active Designs, Units in Stock, Orders Placed, and Revenue.
- **Live Inventory Matrix:** Direct stock quantity editor per SKU with immediate persistence to SQLite3.
- **Live Orders Feed:** Shows all customer orders stored in the SQLite3 database.
- **Add New Design Modal:** Upload product photography directly to the local `uploads/` folder and persist new items into SQLite3 via REST API.

### 7. User Profile & Atelier Privé Client Portal
- **Header Avatar Trigger:** Direct access from the navigation bar.
- **Order History:** Real-time customer order cards loaded from SQLite3 with item thumbnails, tracking ID, and live courier status.
- **Personal Information & Sizing:** Editable profile fields (Full Name, Phone, City, Preferred Size XS–XXL, Preferred Fit) synced directly to SQLite3.
- **Address Book:** Default Residence and Atelier Corporate Billing cards.
- **Clientele Wishlist:** Integrated saved designs with 1-click addition to bag.
- **Atelier Privé Rewards:** Loyalty tier progress ($350 spent towards Platinum), points balance (1,450 pts / $145 value), and exclusive member privileges.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Structure** | Semantic HTML5 (No React/Vue/Angular) |
| **Styling** | Bootstrap 5.3.3 CSS + Custom Vanilla CSS Luxury Design System |
| **Client Scripting** | Modern Vanilla JavaScript (ES6+ Modular Architecture) |
| **Backend Framework** | Node.js with Express.js |
| **Database** | SQLite3 (`backend/ecommerce.sqlite`) |
| **Image Uploads** | Multer disk storage (`uploads/` local folder) |
| **Icons & Typography** | Bootstrap Icons, Google Fonts (`Playfair Display`, `Plus Jakarta Sans`) |

---

## 🔌 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check & service status |
| `GET` | `/api/products` | Retrieve catalog with SQL filters (`category`, `gender`, `search`, `maxPrice`, `sort`, `inStockOnly`) |
| `GET` | `/api/products/:id` | Fetch product details by ID |
| `POST` | `/api/products` | Create new clothing design in SQLite3 |
| `PATCH` | `/api/products/:id/stock` | Update stock quantity for a variant |
| `POST` | `/api/orders` | Create an order with atomic stock deduction |
| `GET` | `/api/orders` | Retrieve all customer orders |
| `POST` | `/api/upload` | Multipart form-data image upload to local `uploads/` |

---

## 💻 Running Locally

### Prerequisites
- Node.js (v18+)

### Start the Application
Run the start command from the project root:
```bash
npm start
```

Or run directly:
```bash
node server.js
```

Then open your browser at:
👉 **`http://localhost:3000`**
