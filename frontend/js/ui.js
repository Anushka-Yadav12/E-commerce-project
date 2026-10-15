/**
 * Atelier UI Renderer
 * Handles all DOM manipulation, modals, sliding drawers, and views.
 */
class UIRenderer {
  constructor() {
    this.selectedModalColor = null;
    this.selectedModalSize = null;
    this.selectedModalQty = 1;
    this.currentPDPProduct = null;
    this.checkoutStep = 1;
  }

  init() {
    this.bindGlobalEvents();
  }

  bindGlobalEvents() {
    // Close drawers when clicking overlay
    const overlay = document.getElementById("drawer-overlay");
    if (overlay) {
      overlay.addEventListener("click", () => this.closeAllDrawers());
    }

    // Modal backdrop click
    document.querySelectorAll(".custom-modal-backdrop").forEach(backdrop => {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          this.closeAllModals();
        }
      });
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeAllDrawers();
        this.closeAllModals();
      }
    });
  }

  showToast(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "atelier-toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `atelier-toast toast-${type}`;
    const icon = type === "success" ? "bi-check-circle-fill text-success" : (type === "warning" ? "bi-exclamation-triangle-fill text-warning" : "bi-info-circle-fill");
    toast.innerHTML = `<i class="bi ${icon} fs-5"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  closeAllDrawers() {
    document.querySelectorAll(".atelier-drawer").forEach(d => d.classList.remove("active"));
    const overlay = document.getElementById("drawer-overlay");
    if (overlay) overlay.classList.remove("active");
  }

  openDrawer(drawerId) {
    this.closeAllDrawers();
    const drawer = document.getElementById(drawerId);
    const overlay = document.getElementById("drawer-overlay");
    if (drawer && overlay) {
      drawer.classList.add("active");
      overlay.classList.add("active");
    }
  }

  closeAllModals() {
    document.querySelectorAll(".custom-modal-backdrop").forEach(m => m.classList.remove("active"));
  }

  openModal(modalId) {
    this.closeAllModals();
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add("active");
  }

  /* -------------------------------------------------------------
     RENDER PRODUCT GRID
  ------------------------------------------------------------- */
  renderProductGrid(products) {
    const grid = document.getElementById("product-grid");
    const countDisplay = document.getElementById("product-count-display");
    if (!grid) return;

    if (countDisplay) {
      countDisplay.textContent = `Showing ${products.length} design${products.length === 1 ? '' : 's'}`;
    }

    if (products.length === 0) {
      grid.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="p-5 rounded-4" style="background: rgba(255,255,255,0.02); border: 1px dashed var(--border-light);">
            <i class="bi bi-search fs-1 text-muted mb-3 d-block"></i>
            <h4 class="fw-bold mb-2">No Clothing Found</h4>
            <p class="text-muted mb-4">We couldn't find items matching your active filter criteria.</p>
            <button class="btn btn-atelier-primary" onclick="window.AtelierStore.resetFilters()">
              <i class="bi bi-arrow-counterclockwise"></i> Reset All Filters
            </button>
          </div>
        </div>
      `;
      return;
    }

    grid.innerHTML = products.map(product => this.createProductCardHtml(product)).join("");
  }

  createProductCardHtml(product) {
    const isWishlisted = window.AtelierStore.isInWishlist(product.id);
    const firstColor = product.colors[0];
    const originalPriceHtml = product.originalPrice 
      ? `<span class="original-price">$${product.originalPrice}</span>` 
      : "";

    let badgeHtml = "";
    if (product.badge) {
      let badgeClass = "badge-new-tag";
      if (product.badge.includes("SALE")) badgeClass = "badge-sale-tag";
      else if (product.badge.includes("BEST")) badgeClass = "badge-bestseller-tag";
      badgeHtml = `<span class="product-badge ${badgeClass}">${product.badge}</span>`;
    }

    const swatchesHtml = product.colors.map((c, i) => `
      <span class="color-dot" style="background-color: ${c.hex};" title="${c.name}" onclick="event.stopPropagation(); window.ui.switchCardColor('${product.id}', ${i})"></span>
    `).join("");

    return `
      <div class="col-12 col-sm-6 col-lg-4 col-xl-3 mb-4">
        <div class="product-card" id="card-${product.id}" onclick="window.ui.openProductModal('${product.id}')">
          <div class="product-image-container">
            ${badgeHtml}
            <button class="card-wishlist-btn ${isWishlisted ? 'active' : ''}" 
                    title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}"
                    onclick="event.stopPropagation(); window.ui.toggleWishlist('${product.id}')">
              <i class="bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'}"></i>
            </button>
            <img id="card-img-${product.id}" 
                 src="${firstColor.image}" 
                 alt="${product.name}" 
                 class="product-img" 
                 loading="lazy">
            <div class="card-quick-overlay">
              <button class="btn-quick-view" onclick="event.stopPropagation(); window.ui.openProductModal('${product.id}')">
                <i class="bi bi-eye me-1"></i> Quick View
              </button>
            </div>
          </div>
          <div class="product-content">
            <span class="product-brand">${product.brand}</span>
            <h3 class="product-name" title="${product.name}">${product.name}</h3>
            <div class="product-rating">
              <span>★ ${product.rating.toFixed(1)}</span>
              <span class="rating-count">(${product.reviewsCount})</span>
            </div>
            <div class="product-meta">
              <div class="price-container">
                <span class="current-price">$${product.price}</span>
                ${originalPriceHtml}
              </div>
              <div class="color-swatches-inline">
                ${swatchesHtml}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  switchCardColor(productId, colorIndex) {
    const product = window.AtelierStore.getProduct(productId);
    if (!product || !product.colors[colorIndex]) return;
    const imgEl = document.getElementById(`card-img-${productId}`);
    if (imgEl) {
      imgEl.src = product.colors[colorIndex].image;
    }
  }

  /* -------------------------------------------------------------
     PRODUCT DETAIL MODAL (PDP)
  ------------------------------------------------------------- */
  openProductModal(productId) {
    const product = window.AtelierStore.getProduct(productId);
    if (!product) return;

    this.currentPDPProduct = product;
    this.selectedModalColor = product.colors[0];
    this.selectedModalSize = product.sizes[0];
    this.selectedModalQty = 1;

    const modal = document.getElementById("pdp-modal");
    if (!modal) return;

    this.renderPDPModalContent();
    this.openModal("pdp-modal");
  }

  renderPDPModalContent() {
    const product = this.currentPDPProduct;
    if (!product) return;

    const modalBody = document.getElementById("pdp-modal-body");
    if (!modalBody) return;

    const isWishlisted = window.AtelierStore.isInWishlist(product.id);
    const stockAvailable = window.AtelierStore.getVariantStock(
      product, 
      this.selectedModalColor.name, 
      this.selectedModalSize
    );

    // Color swatches buttons
    const swatchesHtml = product.colors.map(color => `
      <button class="variant-swatch-btn ${color.name === this.selectedModalColor.name ? 'active' : ''}" 
              style="background-color: ${color.hex};" 
              title="${color.name}"
              onclick="window.ui.selectModalColor('${color.name}')">
      </button>
    `).join("");

    // Size selection pills
    const sizesHtml = product.sizes.map(size => {
      const stock = window.AtelierStore.getVariantStock(product, this.selectedModalColor.name, size);
      const isOut = stock <= 0;
      const isSelected = size === this.selectedModalSize;
      return `
        <button class="size-pill-btn ${isSelected ? 'active' : ''} ${isOut ? 'disabled' : ''}"
                onclick="window.ui.selectModalSize('${size}')"
                ${isOut ? 'disabled' : ''}
                title="${isOut ? 'Out of Stock' : `${stock} available`}">
          ${size}
        </button>
      `;
    }).join("");

    // Stock alert text
    let stockNotice = "";
    if (stockAvailable <= 0) {
      stockNotice = `<span class="badge bg-danger text-white"><i class="bi bi-x-circle me-1"></i> Sold Out in this size</span>`;
    } else if (stockAvailable <= 3) {
      stockNotice = `<span class="badge bg-warning text-dark"><i class="bi bi-exclamation-triangle me-1"></i> Only ${stockAvailable} left in stock - order soon!</span>`;
    } else {
      stockNotice = `<span class="badge bg-success-subtle text-success border border-success"><i class="bi bi-check2-circle me-1"></i> In Stock (${stockAvailable} available)</span>`;
    }

    modalBody.innerHTML = `
      <div class="row g-4 p-2 p-md-4">
        <!-- Gallery Column -->
        <div class="col-12 col-md-6">
          <div class="position-relative rounded-3 overflow-hidden border border-secondary mb-3" style="aspect-ratio: 3/4; background: #161b24;">
            <img id="pdp-main-image" src="${this.selectedModalColor.image}" class="w-100 h-100 object-fit-cover" alt="${product.name}">
          </div>
          <div class="d-flex gap-2">
            <div class="pdp-thumb rounded-2 overflow-hidden border border-warning" style="width: 70px; height: 85px; cursor: pointer;" onclick="document.getElementById('pdp-main-image').src='${this.selectedModalColor.image}'">
              <img src="${this.selectedModalColor.image}" class="w-100 h-100 object-fit-cover">
            </div>
            ${this.selectedModalColor.secondaryImage ? `
            <div class="pdp-thumb rounded-2 overflow-hidden border border-secondary" style="width: 70px; height: 85px; cursor: pointer;" onclick="document.getElementById('pdp-main-image').src='${this.selectedModalColor.secondaryImage}'">
              <img src="${this.selectedModalColor.secondaryImage}" class="w-100 h-100 object-fit-cover">
            </div>` : ''}
          </div>
        </div>

        <!-- Details Column -->
        <div class="col-12 col-md-6 d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <span class="product-brand">${product.brand}</span>
            <button class="btn btn-sm btn-outline-secondary rounded-pill ${isWishlisted ? 'text-danger border-danger' : ''}" onclick="window.ui.toggleWishlist('${product.id}')">
              <i class="bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'} me-1"></i> ${isWishlisted ? 'Saved' : 'Wishlist'}
            </button>
          </div>
          
          <h2 class="h3 fw-bold mb-1">${product.name}</h2>
          <p class="text-muted small mb-3">${product.tagline}</p>

          <div class="d-flex align-items-baseline gap-3 mb-3">
            <span class="fs-3 fw-bold text-main">$${product.price}</span>
            ${product.originalPrice ? `<span class="fs-6 text-muted text-decoration-line-through">$${product.originalPrice}</span>` : ''}
            <div class="ms-auto text-warning small">
              ★ ${product.rating.toFixed(1)} <span class="text-muted">(${product.reviewsCount} customer reviews)</span>
            </div>
          </div>

          <div class="mb-3">
            ${stockNotice}
          </div>

          <!-- Color selection -->
          <div class="mb-3">
            <label class="form-label text-muted small fw-semibold text-uppercase d-block">
              Color: <span class="text-main">${this.selectedModalColor.name}</span>
            </label>
            <div class="d-flex gap-3 align-items-center">
              ${swatchesHtml}
            </div>
          </div>

          <!-- Size selection -->
          <div class="mb-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <label class="form-label text-muted small fw-semibold text-uppercase mb-0">
                Size: <span class="text-main">${this.selectedModalSize}</span>
              </label>
              <button class="btn btn-link text-warning text-decoration-none p-0 small" onclick="window.ui.openSizeGuide()">
                <i class="bi bi-rulers me-1"></i> Size & Fit Guide
              </button>
            </div>
            <div class="d-flex flex-wrap gap-2">
              ${sizesHtml}
            </div>
          </div>

          <!-- Quantity and Add to Bag -->
          <div class="d-flex gap-3 mb-4">
            <div class="qty-control">
              <button class="qty-btn" onclick="window.ui.adjustModalQty(-1)"><i class="bi bi-dash"></i></button>
              <span class="qty-val" id="modal-qty-val">${this.selectedModalQty}</span>
              <button class="qty-btn" onclick="window.ui.adjustModalQty(1)"><i class="bi bi-plus"></i></button>
            </div>
            <button class="btn btn-atelier-primary flex-grow-1" 
                    id="btn-add-to-bag"
                    ${stockAvailable <= 0 ? 'disabled' : ''}
                    onclick="window.ui.handleAddModalToBag()">
              <i class="bi bi-bag-plus me-1"></i> ${stockAvailable <= 0 ? 'Sold Out' : 'Add to Bag'}
            </button>
          </div>

          <!-- Accordion for Fabric & Care -->
          <div class="accordion accordion-flush mt-auto" id="pdpAccordion">
            <div class="accordion-item bg-transparent border-secondary">
              <h2 class="accordion-header">
                <button class="accordion-button collapsed bg-transparent text-main small fw-bold px-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#descCollapse">
                  Description & Tailoring Details
                </button>
              </h2>
              <div id="descCollapse" class="accordion-collapse collapse show" data-bs-parent="#pdpAccordion">
                <div class="accordion-body px-0 text-muted small">
                  <p>${product.description}</p>
                  <p class="mb-0"><strong>Specifications:</strong> ${product.details}</p>
                </div>
              </div>
            </div>
            <div class="accordion-item bg-transparent border-secondary">
              <h2 class="accordion-header">
                <button class="accordion-button collapsed bg-transparent text-main small fw-bold px-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#careCollapse">
                  Garment Care Instructions
                </button>
              </h2>
              <div id="careCollapse" class="accordion-collapse collapse" data-bs-parent="#pdpAccordion">
                <div class="accordion-body px-0 text-muted small">
                  <ul class="mb-0 ps-3">
                    ${product.careInstructions.map(c => `<li>${c}</li>`).join("")}
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  selectModalColor(colorName) {
    if (!this.currentPDPProduct) return;
    const color = this.currentPDPProduct.colors.find(c => c.name === colorName);
    if (color) {
      this.selectedModalColor = color;
      this.renderPDPModalContent();
    }
  }

  selectModalSize(size) {
    this.selectedModalSize = size;
    this.renderPDPModalContent();
  }

  adjustModalQty(delta) {
    const product = this.currentPDPProduct;
    if (!product) return;
    const maxStock = window.AtelierStore.getVariantStock(product, this.selectedModalColor.name, this.selectedModalSize);
    const newQty = this.selectedModalQty + delta;
    if (newQty >= 1 && newQty <= maxStock) {
      this.selectedModalQty = newQty;
      const display = document.getElementById("modal-qty-val");
      if (display) display.textContent = newQty;
    }
  }

  handleAddModalToBag() {
    if (!this.currentPDPProduct || !this.selectedModalColor || !this.selectedModalSize) return;

    const result = window.AtelierStore.addToCart(
      this.currentPDPProduct.id,
      this.selectedModalColor.name,
      this.selectedModalSize,
      this.selectedModalQty
    );

    if (result.success) {
      this.showToast(result.message, "success");
      this.closeAllModals();
      this.openDrawer("cart-drawer");
    } else {
      this.showToast(result.message, "warning");
    }
  }

  openSizeGuide() {
    this.openModal("size-guide-modal");
  }

  /* -------------------------------------------------------------
     CART DRAWER RENDERER
  ------------------------------------------------------------- */
  renderCart() {
    const cart = window.AtelierStore.getCart();
    const totals = window.AtelierStore.getCartTotals();
    const cartItemsContainer = document.getElementById("cart-items-container");
    const cartFooter = document.getElementById("cart-footer");
    const cartBadge = document.getElementById("cart-badge");
    const cartHeaderCount = document.getElementById("cart-header-count");

    // Update Badges
    if (cartBadge) {
      cartBadge.textContent = totals.itemCount;
      cartBadge.style.display = totals.itemCount > 0 ? "flex" : "none";
    }
    if (cartHeaderCount) {
      cartHeaderCount.textContent = `(${totals.itemCount} items)`;
    }

    // Render Shipping Progress Bar
    const shippingBar = document.getElementById("cart-shipping-bar");
    if (shippingBar) {
      if (totals.isFreeShippingUnlocked) {
        shippingBar.innerHTML = `
          <div class="shipping-progress-box">
            <div class="shipping-label">
              <span class="text-success fw-bold"><i class="bi bi-check-circle-fill me-1"></i> Complimentary Express Shipping Unlocked!</span>
              <span class="text-success fw-bold">FREE</span>
            </div>
            <div class="shipping-progress-track">
              <div class="shipping-progress-fill" style="width: 100%;"></div>
            </div>
          </div>
        `;
      } else {
        shippingBar.innerHTML = `
          <div class="shipping-progress-box">
            <div class="shipping-label">
              <span>Add <strong>$${totals.distanceToFreeShipping}</strong> more for Free Shipping</span>
              <span>$${totals.subtotal} / $${totals.freeShippingThreshold}</span>
            </div>
            <div class="shipping-progress-track">
              <div class="shipping-progress-fill" style="width: ${totals.freeShippingProgress}%;"></div>
            </div>
          </div>
        `;
      }
    }

    if (cart.length === 0) {
      if (cartItemsContainer) {
        cartItemsContainer.innerHTML = `
          <div class="text-center py-5">
            <i class="bi bi-bag-x fs-1 text-muted mb-3 d-block"></i>
            <h5 class="fw-bold mb-2">Your Shopping Bag is Empty</h5>
            <p class="text-muted small mb-4">Discover our handcrafted tailoring pieces and elevate your wardrobe.</p>
            <button class="btn btn-atelier-primary" onclick="window.ui.closeAllDrawers()">
              Explore Collection
            </button>
          </div>
        `;
      }
      if (cartFooter) cartFooter.style.display = "none";
      return;
    }

    if (cartFooter) cartFooter.style.display = "block";

    // Items list
    if (cartItemsContainer) {
      cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-info">
            <div class="d-flex justify-content-between align-items-start">
              <h4 class="cart-item-title">${item.name}</h4>
              <button class="cart-item-remove" onclick="window.AtelierStore.removeFromCart('${item.id}')" title="Remove item">
                <i class="bi bi-trash3"></i>
              </button>
            </div>
            <div class="cart-item-variant">
              <span>Color: ${item.color}</span>
              <span>•</span>
              <span>Size: ${item.size}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-2">
              <div class="qty-control">
                <button class="qty-btn" onclick="window.AtelierStore.updateCartQuantity('${item.id}', -1)"><i class="bi bi-dash"></i></button>
                <span class="qty-val">${item.quantity}</span>
                <button class="qty-btn" onclick="window.AtelierStore.updateCartQuantity('${item.id}', 1)"><i class="bi bi-plus"></i></button>
              </div>
              <span class="cart-item-price">$${item.price * item.quantity}</span>
            </div>
          </div>
        </div>
      `).join("");
    }

    // Totals breakdown
    const promo = window.AtelierStore.getPromo();
    const totalsContainer = document.getElementById("cart-totals-breakdown");
    if (totalsContainer) {
      totalsContainer.innerHTML = `
        <div class="d-flex justify-content-between text-muted small mb-1">
          <span>Subtotal</span>
          <span>$${totals.subtotal}</span>
        </div>
        ${totals.discount > 0 ? `
        <div class="d-flex justify-content-between text-success small mb-1">
          <span>Promotional Discount (${promo.code})</span>
          <span>-$${totals.discount}</span>
        </div>` : ''}
        <div class="d-flex justify-content-between text-muted small mb-1">
          <span>Estimated Shipping</span>
          <span>${totals.shipping === 0 ? '<span class="text-success">FREE</span>' : `$${totals.shipping}`}</span>
        </div>
        <div class="d-flex justify-content-between text-muted small mb-2">
          <span>Estimated Tax (8%)</span>
          <span>$${totals.tax}</span>
        </div>
        <div class="d-flex justify-content-between fs-5 fw-bold text-main pt-2 border-top border-secondary">
          <span>Total</span>
          <span class="text-warning">$${totals.total}</span>
        </div>
      `;
    }
  }

  applyPromoCode() {
    const input = document.getElementById("cart-promo-input");
    if (!input) return;
    const code = input.value.trim();
    if (!code) return;

    const result = window.AtelierStore.applyPromo(code);
    if (result.success) {
      this.showToast(`Applied coupon ${code}!`, "success");
      input.value = "";
    } else {
      this.showToast(result.message, "warning");
    }
  }

  /* -------------------------------------------------------------
     WISHLIST DRAWER RENDERER
  ------------------------------------------------------------- */
  toggleWishlist(productId) {
    const isAdded = window.AtelierStore.toggleWishlist(productId);
    const product = window.AtelierStore.getProduct(productId);
    const name = product ? product.name : "Product";
    
    if (isAdded) {
      this.showToast(`Saved ${name} to your Wishlist`, "success");
    } else {
      this.showToast(`Removed from Wishlist`, "info");
    }

    // Refresh UI elements
    const wishButtons = document.querySelectorAll(`.card-wishlist-btn[data-id="${productId}"]`);
    wishButtons.forEach(btn => btn.classList.toggle("active", isAdded));
    this.renderWishlist();
    if (this.currentPDPProduct && this.currentPDPProduct.id === productId) {
      this.renderPDPModalContent();
    }
  }

  renderWishlist() {
    const wishlist = window.AtelierStore.getWishlist();
    const container = document.getElementById("wishlist-items-container");
    const countBadge = document.getElementById("wishlist-badge");

    if (countBadge) {
      countBadge.textContent = wishlist.length;
      countBadge.style.display = wishlist.length > 0 ? "flex" : "none";
    }

    if (!container) return;

    if (wishlist.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-heart fs-1 text-muted mb-3 d-block"></i>
          <h5 class="fw-bold mb-2">Your Wishlist is Empty</h5>
          <p class="text-muted small">Save your favorite styles for quick access later.</p>
        </div>
      `;
      return;
    }

    const products = wishlist.map(id => window.AtelierStore.getProduct(id)).filter(Boolean);

    container.innerHTML = products.map(p => `
      <div class="d-flex gap-3 pb-3 mb-3 border-bottom border-secondary align-items-center">
        <img src="${p.colors[0].image}" class="rounded-2" style="width: 60px; height: 80px; object-fit: cover;">
        <div class="flex-grow-1">
          <h5 class="small fw-bold mb-1">${p.name}</h5>
          <span class="text-warning fw-bold small">$${p.price}</span>
          <div class="mt-2 d-flex gap-2">
            <button class="btn btn-sm btn-atelier-primary py-1 px-2 small" onclick="window.ui.openProductModal('${p.id}')">
              Select Size
            </button>
            <button class="btn btn-sm btn-outline-danger py-1 px-2" onclick="window.ui.toggleWishlist('${p.id}')">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
        </div>
      </div>
    `).join("");
  }

  /* -------------------------------------------------------------
     CHECKOUT FLOW
  ------------------------------------------------------------- */
  openCheckout() {
    const cart = window.AtelierStore.getCart();
    if (cart.length === 0) {
      this.showToast("Your cart is empty", "warning");
      return;
    }
    this.closeAllDrawers();
    this.checkoutStep = 1;
    this.renderCheckoutModal();
    this.openModal("checkout-modal");
  }

  renderCheckoutModal() {
    const totals = window.AtelierStore.getCartTotals();
    const cart = window.AtelierStore.getCart();
    const container = document.getElementById("checkout-content");
    if (!container) return;

    container.innerHTML = `
      <div class="p-3 p-md-4">
        <!-- Steps Breadcrumb -->
        <div class="step-indicator">
          <span class="step-pill ${this.checkoutStep === 1 ? 'active' : (this.checkoutStep > 1 ? 'completed' : '')}">
            1. Shipping Address
          </span>
          <span class="step-pill ${this.checkoutStep === 2 ? 'active' : (this.checkoutStep > 2 ? 'completed' : '')}">
            2. Delivery Method
          </span>
          <span class="step-pill ${this.checkoutStep === 3 ? 'active' : ''}">
            3. Payment
          </span>
        </div>

        <div class="row g-4">
          <!-- Form Section -->
          <div class="col-12 col-lg-7">
            ${this.renderCheckoutCurrentStep()}
          </div>

          <!-- Order Summary Section -->
          <div class="col-12 col-lg-5">
            <div class="p-3 rounded-3" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-light);">
              <h5 class="fw-bold mb-3 small text-uppercase text-muted">Order Review (${totals.itemCount} items)</h5>
              <div class="mb-3" style="max-height: 220px; overflow-y: auto;">
                ${cart.map(item => `
                  <div class="d-flex gap-2 mb-2 pb-2 border-bottom border-secondary small">
                    <img src="${item.image}" style="width: 40px; height: 50px; object-fit: cover;" class="rounded-1">
                    <div class="flex-grow-1">
                      <div class="fw-semibold text-truncate" style="max-width: 170px;">${item.name}</div>
                      <div class="text-muted text-nowrap">${item.size} / ${item.color} x ${item.quantity}</div>
                    </div>
                    <span class="fw-bold text-main">$${item.price * item.quantity}</span>
                  </div>
                `).join("")}
              </div>

              <div class="border-top border-secondary pt-2 small">
                <div class="d-flex justify-content-between mb-1 text-muted">
                  <span>Subtotal</span>
                  <span>$${totals.subtotal}</span>
                </div>
                ${totals.discount > 0 ? `
                <div class="d-flex justify-content-between mb-1 text-success">
                  <span>Discount</span>
                  <span>-$${totals.discount}</span>
                </div>` : ''}
                <div class="d-flex justify-content-between mb-1 text-muted">
                  <span>Shipping</span>
                  <span>${totals.shipping === 0 ? 'FREE' : `$${totals.shipping}`}</span>
                </div>
                <div class="d-flex justify-content-between mb-2 text-muted">
                  <span>Taxes (8%)</span>
                  <span>$${totals.tax}</span>
                </div>
                <div class="d-flex justify-content-between fs-5 fw-bold text-main pt-2 border-top border-secondary">
                  <span>Total Due</span>
                  <span class="text-warning">$${totals.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderCheckoutCurrentStep() {
    if (this.checkoutStep === 1) {
      return `
        <form id="shipping-form" onsubmit="event.preventDefault(); window.ui.goToCheckoutStep(2);">
          <h5 class="fw-bold mb-3">Shipping Destination</h5>
          <div class="row g-2 mb-3">
            <div class="col-6">
              <label class="form-label small text-muted">First Name</label>
              <input type="text" class="checkout-input" id="ship-first-name" required value="Elena">
            </div>
            <div class="col-6">
              <label class="form-label small text-muted">Last Name</label>
              <input type="text" class="checkout-input" id="ship-last-name" required value="Vance">
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label small text-muted">Email for Order Confirmation</label>
            <input type="email" class="checkout-input" id="ship-email" required value="elena.vance@example.com">
          </div>
          <div class="mb-3">
            <label class="form-label small text-muted">Street Address</label>
            <input type="text" class="checkout-input" id="ship-address" required value="742 Evergreen Terrace, Apt 4B">
          </div>
          <div class="row g-2 mb-4">
            <div class="col-6">
              <label class="form-label small text-muted">City</label>
              <input type="text" class="checkout-input" id="ship-city" required value="New York">
            </div>
            <div class="col-6">
              <label class="form-label small text-muted">Postal Code</label>
              <input type="text" class="checkout-input" id="ship-zip" required value="10001">
            </div>
          </div>
          <button type="submit" class="btn btn-atelier-primary w-100">
            Continue to Delivery Method <i class="bi bi-arrow-right ms-1"></i>
          </button>
        </form>
      `;
    } else if (this.checkoutStep === 2) {
      return `
        <div>
          <h5 class="fw-bold mb-3">Select Shipping Method</h5>
          <div class="d-flex flex-column gap-2 mb-4">
            <label class="p-3 rounded-3 border border-warning d-flex align-items-center justify-content-between" style="background: rgba(224,169,109,0.06); cursor: pointer;">
              <div>
                <input type="radio" name="delivery" checked class="form-check-input me-2">
                <span class="fw-bold text-main">Atelier White Glove Delivery</span>
                <div class="text-muted small">2-3 Business Days with Luxury Gift Box</div>
              </div>
              <span class="fw-bold text-success">Complimentary</span>
            </label>
            <label class="p-3 rounded-3 border border-secondary d-flex align-items-center justify-content-between" style="background: rgba(255,255,255,0.02); cursor: pointer;">
              <div>
                <input type="radio" name="delivery" class="form-check-input me-2">
                <span class="fw-bold text-main">Priority Express Next Day</span>
                <div class="text-muted small">Guaranteed by 10:30 AM Tomorrow</div>
              </div>
              <span class="fw-bold text-main">$15.00</span>
            </label>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-atelier-outline" onclick="window.ui.goToCheckoutStep(1)">
              <i class="bi bi-arrow-left"></i> Back
            </button>
            <button class="btn btn-atelier-primary flex-grow-1" onclick="window.ui.goToCheckoutStep(3)">
              Continue to Payment <i class="bi bi-arrow-right ms-1"></i>
            </button>
          </div>
        </div>
      `;
    } else {
      return `
        <form id="payment-form" onsubmit="event.preventDefault(); window.ui.processOrderSubmission();">
          <h5 class="fw-bold mb-3">Payment Simulation</h5>
          <div class="p-3 rounded-3 mb-3" style="background: linear-gradient(135deg, #1c232f 0%, #11151c 100%); border: 1px solid var(--border-light);">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="small text-muted text-uppercase">Atelier Secure Card</span>
              <i class="bi bi-credit-card-2-front fs-4 text-warning"></i>
            </div>
            <div class="mb-3">
              <label class="form-label small text-muted">Card Number</label>
              <input type="text" class="checkout-input font-monospace" required value="4532 •••• •••• 8821">
            </div>
            <div class="row g-2">
              <div class="col-6">
                <label class="form-label small text-muted">Expiry</label>
                <input type="text" class="checkout-input font-monospace" required value="08/28">
              </div>
              <div class="col-6">
                <label class="form-label small text-muted">CVC</label>
                <input type="password" class="checkout-input font-monospace" required value="892">
              </div>
            </div>
          </div>
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-atelier-outline" onclick="window.ui.goToCheckoutStep(2)">
              <i class="bi bi-arrow-left"></i> Back
            </button>
            <button type="submit" class="btn btn-atelier-primary flex-grow-1" id="btn-submit-order">
              <i class="bi bi-lock-fill me-1"></i> Authorize & Place Order
            </button>
          </div>
        </form>
      `;
    }
  }

  goToCheckoutStep(step) {
    this.checkoutStep = step;
    this.renderCheckoutModal();
  }

  async processOrderSubmission() {
    const btn = document.getElementById("btn-submit-order");
    if (btn) {
      btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Processing Payment...`;
      btn.disabled = true;
    }

    const cart = window.AtelierStore.getCart();
    const totals = window.AtelierStore.getCartTotals();

    const orderPayload = {
      customer: {
        fullName: "Elena Vance",
        email: "elena.vance@example.com",
        shippingAddress: "742 Evergreen Terrace, Apt 4B, New York, NY 10001"
      },
      items: [...cart],
      pricing: totals
    };

    try {
      const order = await window.api.createOrder(orderPayload);
      this.closeAllModals();
      this.renderOrderSuccess(order);
      this.openModal("order-success-modal");
    } catch (err) {
      this.showToast("Failed to place order. Please try again.", "warning");
      if (btn) {
        btn.innerHTML = `<i class="bi bi-lock-fill me-1"></i> Authorize & Place Order`;
        btn.disabled = false;
      }
    }
  }

  renderOrderSuccess(order) {
    const container = document.getElementById("order-success-body");
    if (!container) return;

    container.innerHTML = `
      <div class="text-center p-3 p-md-4">
        <div class="d-inline-flex p-3 rounded-circle bg-success-subtle text-success mb-3">
          <i class="bi bi-check-lg fs-1"></i>
        </div>
        <h3 class="fw-bold mb-1">Thank You for Your Order</h3>
        <p class="text-muted small mb-4">A confirmation receipt has been sent to <strong>${order.customer.email}</strong>.</p>
        
        <div class="p-3 rounded-3 text-start mb-4" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-light);">
          <div class="d-flex justify-content-between mb-2">
            <span class="text-muted small">Order Reference:</span>
            <span class="fw-bold text-warning font-monospace">${order.orderId}</span>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span class="text-muted small">Tracking ID:</span>
            <span class="text-main font-monospace small">${order.trackingNumber}</span>
          </div>
          <div class="d-flex justify-content-between">
            <span class="text-muted small">Total Charged:</span>
            <span class="fw-bold text-main">$${order.pricing.total}</span>
          </div>
        </div>

        <!-- Tracking Timeline -->
        <h6 class="text-muted text-uppercase small fw-bold mb-3 text-start">Fulfillment Status</h6>
        <div class="timeline-track">
          <div class="timeline-node active">
            <div class="timeline-circle"><i class="bi bi-check-lg"></i></div>
            <div class="small fw-semibold">Confirmed</div>
          </div>
          <div class="timeline-node active">
            <div class="timeline-circle"><i class="bi bi-box-seam"></i></div>
            <div class="small fw-semibold">Atelier Prep</div>
          </div>
          <div class="timeline-node">
            <div class="timeline-circle"><i class="bi bi-truck"></i></div>
            <div class="small text-muted">In Transit</div>
          </div>
          <div class="timeline-node">
            <div class="timeline-circle"><i class="bi bi-house-door"></i></div>
            <div class="small text-muted">Delivered</div>
          </div>
        </div>

        <button class="btn btn-atelier-primary w-100" onclick="window.ui.closeAllModals()">
          Continue Shopping
        </button>
      </div>
    `;
  }

  /* -------------------------------------------------------------
     ADMIN / INVENTORY MANAGER VIEW
  ------------------------------------------------------------- */
  toggleAdminPortal() {
    const isNowAdmin = window.AtelierStore.toggleAdminMode();
    const storefront = document.getElementById("storefront-view");
    const adminView = document.getElementById("admin-portal-view");
    const toggleBtn = document.getElementById("admin-toggle-btn");

    if (isNowAdmin) {
      if (storefront) storefront.style.display = "none";
      if (adminView) adminView.style.display = "block";
      if (toggleBtn) toggleBtn.innerHTML = `<i class="bi bi-shop me-1"></i> Return to Storefront`;
      this.renderAdminDashboard();
    } else {
      if (storefront) storefront.style.display = "block";
      if (adminView) adminView.style.display = "none";
      if (toggleBtn) toggleBtn.innerHTML = `<i class="bi bi-shield-lock me-1"></i> Merchant Admin`;
    }
  }

  renderAdminDashboard() {
    const products = window.AtelierStore.getProducts();
    const orders = window.AtelierStore.getOrders();
    const inventoryTableBody = document.getElementById("admin-inventory-tbody");
    const ordersTableBody = document.getElementById("admin-orders-tbody");

    // Metrics
    const totalInventoryCount = products.reduce((acc, p) => {
      return acc + Object.values(p.inventory || {}).reduce((sum, n) => sum + n, 0);
    }, 0);

    const totalRevenue = orders.reduce((acc, o) => acc + o.pricing.total, 0);

    document.getElementById("metric-products-count").textContent = products.length;
    document.getElementById("metric-units-count").textContent = totalInventoryCount;
    document.getElementById("metric-orders-count").textContent = orders.length;
    document.getElementById("metric-revenue").textContent = `$${totalRevenue}`;

    // Inventory Table
    if (inventoryTableBody) {
      const rows = [];
      products.forEach(p => {
        p.colors.forEach(c => {
          p.sizes.forEach(sz => {
            const variantKey = `${c.name.toLowerCase()}-${sz.toLowerCase()}`;
            const currentStock = (p.inventory && p.inventory[variantKey] !== undefined) ? p.inventory[variantKey] : 0;
            rows.push(`
              <tr>
                <td><img src="${c.image}" style="width: 36px; height: 46px; object-fit: cover;" class="rounded-1 me-2"> <strong>${p.name}</strong></td>
                <td><span class="badge bg-secondary-subtle text-white">${p.category}</span></td>
                <td><span class="color-dot me-1" style="background:${c.hex}"></span> ${c.name}</td>
                <td><span class="badge bg-dark border border-secondary">${sz}</span></td>
                <td>$${p.price}</td>
                <td>
                  <input type="number" 
                         min="0" 
                         class="form-control form-control-sm d-inline-block text-center" 
                         style="width: 70px; background: rgba(255,255,255,0.06); color:#fff; border-color: var(--border-light);" 
                         value="${currentStock}" 
                         onchange="window.ui.handleStockUpdate('${p.id}', '${variantKey}', this.value)">
                </td>
                <td>
                  ${currentStock === 0 ? '<span class="badge bg-danger">Out of Stock</span>' : (currentStock <= 3 ? '<span class="badge bg-warning text-dark">Low Stock</span>' : '<span class="badge bg-success">Healthy</span>')}
                </td>
              </tr>
            `);
          });
        });
      });
      inventoryTableBody.innerHTML = rows.join("");
    }

    // Orders Table
    if (ordersTableBody) {
      if (orders.length === 0) {
        ordersTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No customer orders placed yet in this session.</td></tr>`;
      } else {
        ordersTableBody.innerHTML = orders.map(ord => `
          <tr>
            <td class="font-monospace text-warning fw-bold">${ord.orderId}</td>
            <td>${ord.customer.fullName}</td>
            <td>${ord.items.length} items</td>
            <td class="fw-bold">$${ord.pricing.total}</td>
            <td><span class="badge bg-info-subtle text-info">${ord.status}</span></td>
            <td><span class="text-muted small">${new Date(ord.createdAt).toLocaleTimeString()}</span></td>
          </tr>
        `).join("");
      }
    }
  }

  handleStockUpdate(productId, variantKey, val) {
    const qty = parseInt(val, 10);
    window.api.updateStock(productId, variantKey, qty);
    this.showToast(`Stock updated for ${variantKey} to ${qty}`, "info");
  }

  async handleCreateProduct(form) {
    const btn = document.getElementById("btn-save-new-product");
    const fileInput = document.getElementById("new-product-file");
    if (!fileInput || !fileInput.files[0]) {
      this.showToast("Please choose a garment image to upload", "warning");
      return;
    }

    if (btn) {
      btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Uploading & Saving...`;
      btn.disabled = true;
    }

    try {
      // 1. Upload photo to local /uploads/
      const uploadRes = await window.api.uploadImage(fileInput.files[0]);
      const imageUrl = uploadRes.url;

      // 2. Prepare payload
      const formData = new FormData(form);
      const name = formData.get("name");
      const price = parseFloat(formData.get("price"));
      const category = formData.get("category");
      const gender = formData.get("gender");
      const colorName = formData.get("colorName") || "Standard";
      const colorHex = formData.get("colorHex") || "#C19A6B";
      const description = formData.get("description");
      const badge = formData.get("badge") || "NEW";
      const initialStock = parseInt(formData.get("initialStock"), 10) || 5;

      const sizes = ["S", "M", "L", "XL"];
      const inventory = {};
      sizes.forEach(sz => {
        inventory[`${colorName.toLowerCase()}-${sz.toLowerCase()}`] = initialStock;
      });

      const productPayload = {
        name,
        price,
        category,
        gender,
        badge,
        isNew: true,
        tagline: `${colorName} tailored in ${category}`,
        description,
        sizes,
        colors: [
          {
            name: colorName,
            hex: colorHex,
            image: imageUrl,
            secondaryImage: imageUrl
          }
        ],
        inventory
      };

      // 3. Save to SQLite3 backend
      await window.api.addProduct(productPayload);
      this.showToast(`Published "${name}" with local photo upload!`, "success");
      form.reset();
      this.closeAllModals();

      // Refresh catalog and admin
      const prods = await window.api.getProducts();
      window.ui.renderProductGrid(prods);
      this.renderAdminDashboard();
    } catch (err) {
      console.error(err);
      this.showToast("Failed to create product: " + err.message, "danger");
    } finally {
      if (btn) {
        btn.innerHTML = `<i class="bi bi-cloud-arrow-up me-1"></i> Upload & Save to Database`;
        btn.disabled = false;
      }
    }
  }
}

// Global UI renderer instance
window.ui = new UIRenderer();
