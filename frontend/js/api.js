/**
 * Decoupled API Client
 * Clean abstraction layer separating the frontend from the backend.
 * Automatically communicates with the Express REST API (/api/*) when available,
 * and seamlessly uses client-side reactive store & mock data when running standalone.
 */
class ApiService {
  constructor(baseUrl = "") {
    this.baseUrl = baseUrl;
    this.useMock = false;
  }

  async checkBackendAvailability() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, { method: "GET", headers: { "Accept": "application/json" } });
      if (response.ok) {
        this.useMock = false;
        return true;
      }
    } catch (e) {
      this.useMock = true;
    }
    return false;
  }

  /**
   * Fetch all products with optional filtering and sorting
   */
  async getProducts(params = {}) {
    if (!this.useMock) {
      try {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${this.baseUrl}/api/products${query ? `?${query}` : ""}`);
        if (response.ok) {
          const data = await response.json();
          if (window.AtelierStore) {
            window.AtelierStore.setProductsFromApi(data);
          }
          return data;
        }
      } catch (err) {
        console.warn("Backend API not reachable. Using decoupled client state.", err);
        this.useMock = true;
      }
    }

    // Client-side fallback implementation
    let products = window.AtelierStore ? window.AtelierStore.getProducts() : INITIAL_PRODUCTS;

    if (params.category && params.category !== "all") {
      products = products.filter(p => p.category.toLowerCase() === params.category.toLowerCase());
    }
    if (params.gender && params.gender !== "all") {
      products = products.filter(p => p.gender.toLowerCase() === params.gender.toLowerCase() || p.gender === "unisex");
    }
    if (params.search) {
      const term = params.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.brand.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }
    if (params.maxPrice) {
      products = products.filter(p => p.price <= parseFloat(params.maxPrice));
    }
    if (params.size) {
      products = products.filter(p => p.sizes.includes(params.size));
    }
    if (params.inStockOnly === "true" || params.inStockOnly === true) {
      products = products.filter(p => {
        const totalStock = Object.values(p.inventory).reduce((acc, count) => acc + count, 0);
        return totalStock > 0;
      });
    }

    // Sorting
    if (params.sort) {
      switch (params.sort) {
        case "price-asc":
          products = [...products].sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          products = [...products].sort((a, b) => b.price - a.price);
          break;
        case "rating":
          products = [...products].sort((a, b) => b.rating - a.rating);
          break;
        case "newest":
          products = [...products].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
          break;
        default:
          break;
      }
    }

    return products;
  }

  /**
   * Fetch a single product by ID
   */
  async getProductById(id) {
    if (!this.useMock) {
      try {
        const response = await fetch(`${this.baseUrl}/api/products/${id}`);
        if (response.ok) return await response.json();
      } catch (err) {
        this.useMock = true;
      }
    }
    const products = window.AtelierStore ? window.AtelierStore.getProducts() : INITIAL_PRODUCTS;
    return products.find(p => p.id === id) || null;
  }

  /**
   * Submit an order to backend / local storage
   */
  async createOrder(orderPayload) {
    if (!this.useMock) {
      try {
        const response = await fetch(`${this.baseUrl}/api/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload)
        });
        if (response.ok) {
          const createdOrder = await response.json();
          if (window.AtelierStore) {
            window.AtelierStore.recordOrder(createdOrder);
          }
          return createdOrder;
        }
      } catch (err) {
        this.useMock = true;
      }
    }

    // Fallback order creation
    const generatedOrder = {
      ...orderPayload,
      orderId: "ORD-" + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      status: "Processing",
      trackingNumber: "ATL-" + Math.random().toString(36).substring(2, 9).toUpperCase()
    };

    if (window.AtelierStore) {
      window.AtelierStore.recordOrder(generatedOrder);
    }
    return generatedOrder;
  }

  /**
   * Fetch all orders (for merchant / admin view)
   */
  async getOrders() {
    if (!this.useMock) {
      try {
        const response = await fetch(`${this.baseUrl}/api/orders`);
        if (response.ok) return await response.json();
      } catch (err) {
        this.useMock = true;
      }
    }
    return window.AtelierStore ? window.AtelierStore.getOrders() : [];
  }

  /**
   * Update product stock (for merchant / admin view)
   */
  async updateStock(productId, variantKey, stockQty) {
    if (!this.useMock) {
      try {
        const response = await fetch(`${this.baseUrl}/api/products/${productId}/stock`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantKey, stockQty })
        });
        if (response.ok) return await response.json();
      } catch (err) {
        this.useMock = true;
      }
    }
    if (window.AtelierStore) {
      return window.AtelierStore.updateProductInventory(productId, variantKey, stockQty);
    }
    return false;
  }

  /**
   * Upload an image to the local /uploads folder
   */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);
    const response = await fetch(`${this.baseUrl}/api/upload`, {
      method: "POST",
      body: formData
    });
    if (!response.ok) throw new Error("Image upload failed");
    return await response.json();
  }

  /**
   * Add a new product design to SQLite3
   */
  async addProduct(productPayload) {
    const response = await fetch(`${this.baseUrl}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productPayload)
    });
    if (!response.ok) throw new Error("Failed to create product");
    return await response.json();
  }
}

// Global API instance
window.api = new ApiService();
