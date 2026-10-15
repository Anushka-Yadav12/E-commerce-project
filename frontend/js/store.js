/**
 * Atelier Store - Reactive State Management Engine
 * Implements a lightweight Pub/Sub store with local storage persistence.
 */
class Store {
  constructor() {
    this.STORAGE_KEYS = {
      CART: "atelier_cart_v1",
      WISHLIST: "atelier_wishlist_v1",
      ORDERS: "atelier_orders_v1",
      PRODUCTS: "atelier_products_v1",
      PROMO: "atelier_promo_v1"
    };

    this.subscribers = new Map();

    // Initialize State
    this.state = {
      products: this.loadFromStorage(this.STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS),
      cart: this.loadFromStorage(this.STORAGE_KEYS.CART, []),
      wishlist: this.loadFromStorage(this.STORAGE_KEYS.WISHLIST, []),
      orders: this.loadFromStorage(this.STORAGE_KEYS.ORDERS, []),
      appliedPromo: this.loadFromStorage(this.STORAGE_KEYS.PROMO, null),
      filters: {
        category: "all",
        gender: "all",
        sort: "featured",
        search: "",
        maxPrice: 350,
        size: null,
        inStockOnly: false
      },
      isAdminMode: false,
      activeProductModal: null,
      activeDrawer: null // 'cart' | 'wishlist' | 'checkout' | 'admin'
    };
  }

  loadFromStorage(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn(`Failed to read from localStorage: ${key}`, e);
      return fallback;
    }
  }

  saveToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Failed to write to localStorage: ${key}`, e);
    }
  }

  // Subscribe to state change events
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event).add(callback);
    return () => this.subscribers.get(event).delete(callback);
  }

  notify(event, data) {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event).forEach(cb => {
        try { cb(data, this.state); } catch (err) { console.error(`Error in subscriber for ${event}:`, err); }
      });
    }
    if (this.subscribers.has("*")) {
      this.subscribers.get("*").forEach(cb => {
        try { cb(event, data, this.state); } catch (err) { console.error(err); }
      });
    }
  }

  setProductsFromApi(products) {
    if (Array.isArray(products) && products.length > 0) {
      this.state.products = products;
    }
  }

  // Getters
  getProducts() {
    return this.state.products;
  }

  getProduct(id) {
    return this.state.products.find(p => p.id === id);
  }

  getCart() {
    return this.state.cart;
  }

  getWishlist() {
    return this.state.wishlist;
  }

  getOrders() {
    return this.state.orders;
  }

  getFilters() {
    return { ...this.state.filters };
  }

  getPromo() {
    return this.state.appliedPromo;
  }

  // Stock & Inventory
  getVariantStock(product, colorName, size) {
    if (!product || !product.inventory) return 0;
    const key = `${colorName.toLowerCase()}-${size.toLowerCase()}`;
    return product.inventory[key] ?? 0;
  }

  updateProductInventory(productId, variantKey, stockQty) {
    const product = this.getProduct(productId);
    if (!product) return false;
    if (!product.inventory) product.inventory = {};
    product.inventory[variantKey.toLowerCase()] = Math.max(0, parseInt(stockQty, 10) || 0);
    this.saveToStorage(this.STORAGE_KEYS.PRODUCTS, this.state.products);
    this.notify("inventory:updated", { productId, variantKey, stockQty });
    return true;
  }

  // Cart Operations
  addToCart(productId, colorName, size, quantity = 1) {
    const product = this.getProduct(productId);
    if (!product) return { success: false, message: "Product not found" };

    const selectedColor = product.colors.find(c => c.name.toLowerCase() === colorName.toLowerCase()) || product.colors[0];
    const availableStock = this.getVariantStock(product, selectedColor.name, size);

    if (availableStock <= 0) {
      return { success: false, message: `Sorry, ${product.name} in ${selectedColor.name} (${size}) is sold out.` };
    }

    const cartItemId = `${productId}-${selectedColor.name.toLowerCase().replace(/\s+/g, '-')}-${size.toLowerCase()}`;
    const existingIndex = this.state.cart.findIndex(item => item.id === cartItemId);

    if (existingIndex > -1) {
      const existingItem = this.state.cart[existingIndex];
      const newQty = existingItem.quantity + quantity;
      if (newQty > availableStock) {
        return { success: false, message: `Cannot add more. Only ${availableStock} units available in stock.` };
      }
      existingItem.quantity = newQty;
    } else {
      if (quantity > availableStock) {
        return { success: false, message: `Only ${availableStock} units available in stock.` };
      }
      this.state.cart.push({
        id: cartItemId,
        productId: product.id,
        name: product.name,
        brand: product.brand,
        color: selectedColor.name,
        colorHex: selectedColor.hex,
        size: size,
        price: product.price,
        originalPrice: product.originalPrice,
        image: selectedColor.image,
        quantity: quantity,
        maxStock: availableStock
      });
    }

    this.saveToStorage(this.STORAGE_KEYS.CART, this.state.cart);
    this.notify("cart:updated", this.state.cart);
    return { success: true, message: `Added ${product.name} (${size}) to your bag.` };
  }

  updateCartQuantity(cartItemId, delta) {
    const item = this.state.cart.find(i => i.id === cartItemId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      this.removeFromCart(cartItemId);
      return;
    }

    const product = this.getProduct(item.productId);
    const availableStock = product ? this.getVariantStock(product, item.color, item.size) : item.maxStock;

    if (newQty > availableStock) {
      this.notify("toast:show", { message: `Maximum available quantity is ${availableStock}`, type: "warning" });
      return;
    }

    item.quantity = newQty;
    this.saveToStorage(this.STORAGE_KEYS.CART, this.state.cart);
    this.notify("cart:updated", this.state.cart);
  }

  removeFromCart(cartItemId) {
    this.state.cart = this.state.cart.filter(item => item.id !== cartItemId);
    this.saveToStorage(this.STORAGE_KEYS.CART, this.state.cart);
    this.notify("cart:updated", this.state.cart);
  }

  clearCart() {
    this.state.cart = [];
    this.saveToStorage(this.STORAGE_KEYS.CART, this.state.cart);
    this.notify("cart:updated", this.state.cart);
  }

  // Wishlist Operations
  toggleWishlist(productId) {
    const exists = this.state.wishlist.includes(productId);
    if (exists) {
      this.state.wishlist = this.state.wishlist.filter(id => id !== productId);
    } else {
      this.state.wishlist.push(productId);
    }
    this.saveToStorage(this.STORAGE_KEYS.WISHLIST, this.state.wishlist);
    this.notify("wishlist:updated", this.state.wishlist);
    return !exists;
  }

  isInWishlist(productId) {
    return this.state.wishlist.includes(productId);
  }

  // Promo Engine
  applyPromo(code) {
    const upperCode = (code || "").trim().toUpperCase();
    if (PROMO_CODES && PROMO_CODES[upperCode]) {
      this.state.appliedPromo = {
        code: upperCode,
        ...PROMO_CODES[upperCode]
      };
      this.saveToStorage(this.STORAGE_KEYS.PROMO, this.state.appliedPromo);
      this.notify("cart:updated", this.state.cart);
      return { success: true, promo: this.state.appliedPromo };
    }
    return { success: false, message: "Invalid promotional code" };
  }

  removePromo() {
    this.state.appliedPromo = null;
    this.saveToStorage(this.STORAGE_KEYS.PROMO, null);
    this.notify("cart:updated", this.state.cart);
  }

  // Totals Calculation
  getCartTotals() {
    const subtotal = this.state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const freeShippingThreshold = 150;
    let shipping = subtotal > 0 ? (subtotal >= freeShippingThreshold ? 0 : 15) : 0;
    let discount = 0;

    if (this.state.appliedPromo && subtotal > 0) {
      if (this.state.appliedPromo.discountPercent) {
        discount = Math.round((subtotal * this.state.appliedPromo.discountPercent) / 100);
      } else if (this.state.appliedPromo.discountFlat) {
        discount = Math.min(subtotal, this.state.appliedPromo.discountFlat);
      }
      if (this.state.appliedPromo.freeShipping) {
        shipping = 0;
      }
    }

    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = taxableAmount > 0 ? Math.round(taxableAmount * 0.08) : 0; // 8% sales tax
    const total = taxableAmount + shipping + tax;
    const distanceToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
    const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

    return {
      itemCount: this.state.cart.reduce((cnt, item) => cnt + item.quantity, 0),
      subtotal,
      discount,
      shipping,
      tax,
      total,
      freeShippingThreshold,
      distanceToFreeShipping,
      freeShippingProgress,
      isFreeShippingUnlocked: subtotal >= freeShippingThreshold || (this.state.appliedPromo && this.state.appliedPromo.freeShipping)
    };
  }

  // Filter Management
  setFilter(key, value) {
    this.state.filters[key] = value;
    this.notify("filters:changed", this.state.filters);
  }

  resetFilters() {
    this.state.filters = {
      category: "all",
      gender: "all",
      sort: "featured",
      search: "",
      maxPrice: 350,
      size: null,
      inStockOnly: false
    };
    this.notify("filters:changed", this.state.filters);
  }

  // Order Recording
  recordOrder(order) {
    this.state.orders.unshift(order);
    this.saveToStorage(this.STORAGE_KEYS.ORDERS, this.state.orders);

    // Deduct stock for ordered items
    order.items.forEach(item => {
      const product = this.getProduct(item.productId);
      if (product && product.inventory) {
        const key = `${item.color.toLowerCase()}-${item.size.toLowerCase()}`;
        const currentStock = product.inventory[key] || 0;
        product.inventory[key] = Math.max(0, currentStock - item.quantity);
      }
    });

    this.saveToStorage(this.STORAGE_KEYS.PRODUCTS, this.state.products);
    this.clearCart();
    this.notify("orders:updated", this.state.orders);
    this.notify("inventory:updated", {});
  }

  // Admin Mode Toggle
  toggleAdminMode() {
    this.state.isAdminMode = !this.state.isAdminMode;
    this.notify("admin:toggled", this.state.isAdminMode);
    return this.state.isAdminMode;
  }
}

// Global Store Instance
window.AtelierStore = new Store();
