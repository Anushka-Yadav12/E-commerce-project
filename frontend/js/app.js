/**
 * Main Application Orchestrator
 * Connects User Interactions, State Store, and Decoupled API Client.
 */
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize UI event handlers
  window.ui.init();

  // Test backend availability (Decoupled check)
  const isBackendLive = await window.api.checkBackendAvailability();
  console.log(`[Atelier Architecture] Backend API live: ${isBackendLive}. Using ${isBackendLive ? 'REST API' : 'Standalone Reactive Client Store'}.`);

  // Initial Product Load
  async function reloadCatalog() {
    const filters = window.AtelierStore.getFilters();
    const products = await window.api.getProducts(filters);
    window.ui.renderProductGrid(products);
  }

  // Subscribe to State Changes
  window.AtelierStore.subscribe("filters:changed", () => reloadCatalog());
  window.AtelierStore.subscribe("cart:updated", () => window.ui.renderCart());
  window.AtelierStore.subscribe("wishlist:updated", () => window.ui.renderWishlist());
  window.AtelierStore.subscribe("toast:show", (data) => window.ui.showToast(data.message, data.type));
  window.AtelierStore.subscribe("inventory:updated", () => {
    reloadCatalog();
    if (window.AtelierStore.state.isAdminMode) {
      window.ui.renderAdminDashboard();
    }
  });

  // Initial UI Render
  await reloadCatalog();
  window.ui.renderCart();
  window.ui.renderWishlist();

  // Bind Category Filter Pills
  document.querySelectorAll(".category-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".category-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      const category = pill.getAttribute("data-category") || "all";
      window.AtelierStore.setFilter("category", category);
    });
  });

  // Search Input with Debounce
  const searchInput = document.getElementById("catalog-search-input");
  let searchTimeout = null;
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        window.AtelierStore.setFilter("search", e.target.value.trim());
      }, 250);
    });
  }

  // Sort Dropdown
  const sortSelect = document.getElementById("catalog-sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      window.AtelierStore.setFilter("sort", e.target.value);
    });
  }

  // Gender Filter Pills
  document.querySelectorAll(".gender-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".gender-filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      window.AtelierStore.setFilter("gender", btn.getAttribute("data-gender"));
    });
  });

  // Price Range Slider
  const priceSlider = document.getElementById("price-filter-slider");
  const priceDisplay = document.getElementById("price-filter-val");
  if (priceSlider && priceDisplay) {
    priceSlider.addEventListener("input", (e) => {
      priceDisplay.textContent = `$${e.target.value}`;
    });
    priceSlider.addEventListener("change", (e) => {
      window.AtelierStore.setFilter("maxPrice", e.target.value);
    });
  }

  // In Stock Only Checkbox
  const inStockCheckbox = document.getElementById("in-stock-checkbox");
  if (inStockCheckbox) {
    inStockCheckbox.addEventListener("change", (e) => {
      window.AtelierStore.setFilter("inStockOnly", e.target.checked);
    });
  }

  // Reset Filters Button
  const resetFiltersBtn = document.getElementById("btn-reset-filters");
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", () => {
      window.AtelierStore.resetFilters();
      // Reset UI elements
      document.querySelectorAll(".category-pill").forEach(p => p.classList.toggle("active", p.getAttribute("data-category") === "all"));
      document.querySelectorAll(".gender-filter-btn").forEach(b => b.classList.toggle("active", b.getAttribute("data-gender") === "all"));
      if (searchInput) searchInput.value = "";
      if (sortSelect) sortSelect.value = "featured";
      if (priceSlider) { priceSlider.value = 350; priceDisplay.textContent = "$350"; }
      if (inStockCheckbox) inStockCheckbox.checked = false;
      window.ui.closeAllDrawers();
    });
  }

  // Admin Portal Toggle
  const adminToggleBtn = document.getElementById("admin-toggle-btn");
  if (adminToggleBtn) {
    adminToggleBtn.addEventListener("click", () => {
      window.ui.toggleAdminPortal();
    });
  }
});
