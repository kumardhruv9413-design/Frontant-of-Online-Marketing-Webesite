/* ==========================================================================
   JAVASCRIPT FUNDAMENTALS: CONSTANTS, VARIABLES, DATA TYPES, ARRAYS & OBJECTS
   ========================================================================== */
const STORAGE_KEYS = {
  PRODUCTS: "campusmart_products_v1",
  CART: "campusmart_cart_v1",
  ORDERS: "campusmart_orders_v1",
  USER: "campusmart_user_v1"
};

const SEED_PRODUCTS = [
  {
    id: 1001,
    name: "Casio FX-991EX Scientific Calculator",
    category: "Electronics",
    price: 1150,
    stock: 9,
    condition: "Like New",
    icon: "🧮",
    description: "552 functions, high-resolution natural textbook display, solar + battery powered. Approved for engineering exams.",
    reviews: [
      { author: "Aarav Sharma", rating: 5, comment: "Essential for calculus and linear algebra exams!" },
      { author: "Neha Verma", rating: 4, comment: "Original unit in clean condition." }
    ]
  },
  {
    id: 1002,
    name: "Data Structures & Algorithms Handbook",
    category: "Books",
    price: 450,
    stock: 14,
    condition: "Annotated",
    icon: "📘",
    description: "Covers arrays, linked lists, trees, graphs, sorting, and Big-O complexity with solved C and Python code.",
    reviews: [
      { author: "Rohan Das", rating: 5, comment: "Super helpful notes for lab evaluations." }
    ]
  },
  {
    id: 1003,
    name: "Foldable Aluminum Laptop Stand",
    category: "Accessories",
    price: 699,
    stock: 12,
    condition: "Brand New",
    icon: "💻",
    description: "6-level adjustable ergonomic height, open-back heat dissipation design for 13 to 16-inch laptops.",
    reviews: [
      { author: "Priya Nair", rating: 4, comment: "Sturdy build and fits easily inside a backpack." }
    ]
  },
  {
    id: 1004,
    name: "Rechargeable LED Study Desk Lamp",
    category: "Hostel Gear",
    price: 540,
    stock: 7,
    condition: "Brand New",
    icon: "💡",
    description: "Touch dimmer with 3 color temperatures, flexible gooseneck, and USB charging cable for hostel desks.",
    reviews: []
  },
  {
    id: 1005,
    name: "Compact Mechanical Keyboard (75%)",
    category: "Electronics",
    price: 2150,
    stock: 4,
    condition: "Verified",
    icon: "⌨️",
    description: "Tactile mechanical switches, detachable USB-C cable, white LED backlight, compact layout for coding.",
    reviews: [
      { author: "Manjeet Singh", rating: 5, comment: "Crisp typing feel for long programming sessions." }
    ]
  },
  {
    id: 1006,
    name: "Engineering Graphics Mini-Drafter Set",
    category: "Accessories",
    price: 390,
    stock: 18,
    condition: "Good",
    icon: "📐",
    description: "Complete mini-drafter with precision scale, compass box, and water-resistant carrying sleeve.",
    reviews: []
  }
];

/* Application State */
let products = loadFromStorage(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
let cart = loadFromStorage(STORAGE_KEYS.CART, []);
let orders = loadFromStorage(STORAGE_KEYS.ORDERS, []);
let currentUser = loadFromStorage(STORAGE_KEYS.USER, null);

/* ==========================================================================
   STORAGE & HELPER FUNCTIONS
   ========================================================================== */
function loadFromStorage(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return JSON.parse(JSON.stringify(fallback));
  try {
    return JSON.parse(raw);
  } catch (err) {
    return JSON.parse(JSON.stringify(fallback));
  }
}

function saveAllState() {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  syncHeaderUI();
}

function resetDemoData() {
  if (!confirm("Reset products, cart, and orders back to initial demo state?")) return;
  products = JSON.parse(JSON.stringify(SEED_PRODUCTS));
  cart = [];
  orders = [];
  saveAllState();
  renderCatalogue();
  renderCart();
  renderOrders();
  if (currentUser && currentUser.role === "admin") renderAdminTable();
}

function formatINR(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

function calculateAverageRating(reviewsArray) {
  if (!Array.isArray(reviewsArray) || reviewsArray.length === 0) return 0;
  const totalStars = reviewsArray.reduce((sum, item) => sum + Number(item.rating), 0);
  return Number((totalStars / reviewsArray.length).toFixed(1));
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ==========================================================================
   NAVIGATION & ROLE UI SYNCHRONIZATION
   ========================================================================== */
function switchView(viewName) {
  const sections = document.querySelectorAll(".view-section");
  sections.forEach(sec => sec.classList.add("hidden"));

  const navButtons = document.querySelectorAll(".nav-btn[data-view]");
  navButtons.forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-view") === viewName);
  });

  if (viewName === "admin") {
    if (!currentUser || currentUser.role !== "admin") {
      alert("Admin access required. Please log in with the Admin role.");
      openAuthModal();
      switchView("catalogue");
      return;
    }
    renderAdminTable();
  }

  const target = document.getElementById("view-" + viewName);
  if (target) target.classList.remove("hidden");

  if (viewName === "catalogue") renderCatalogue();
  if (viewName === "cart") renderCart();
  if (viewName === "orders") renderOrders();
}

function syncHeaderUI() {
  const totalCartItems = cart.reduce((acc, item) => acc + item.qty, 0);
  document.getElementById("cart-badge").textContent = totalCartItems;

  const authBtn = document.getElementById("auth-btn");
  const adminNavBtn = document.getElementById("nav-admin-btn");
  const statusEl = document.getElementById("session-status");

  if (currentUser) {
    authBtn.textContent = "Logout (" + currentUser.name.split(" ")[0] + ")";
    authBtn.onclick = handleLogout;
    statusEl.innerHTML = `Signed in as <strong>${escapeHTML(currentUser.name)}</strong> (${escapeHTML(currentUser.email)}) &bull; Role: <strong>${currentUser.role.toUpperCase()}</strong>`;

    if (currentUser.role === "admin") {
      adminNavBtn.classList.remove("hidden");
    } else {
      adminNavBtn.classList.add("hidden");
    }
  } else {
    authBtn.textContent = "Login / Register";
    authBtn.onclick = openAuthModal;
    adminNavBtn.classList.add("hidden");
    statusEl.innerHTML = `Browsing as <strong>Guest</strong>. Log in as <strong>Admin</strong> to manage products or <strong>Customer</strong> to place orders.`;
  }
}

/* ==========================================================================
   AUTHENTICATION & FORM VALIDATION
   ========================================================================== */
function openAuthModal() {
  document.getElementById("auth-modal").classList.remove("hidden");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add("hidden");
}

function backdropClose(event, modalId) {
  if (event.target.id === modalId) {
    closeModal(modalId);
  }
}

function handleAuthSubmit(event) {
  event.preventDefault();

  const nameInput = document.getElementById("auth-name").value.trim();
  const emailInput = document.getElementById("auth-email").value.trim();
  const passwordInput = document.getElementById("auth-password").value;
  const selectedRole = document.querySelector('input[name="auth-role"]:checked').value;

  const errName = document.getElementById("err-auth-name");
  const errEmail = document.getElementById("err-auth-email");
  const errPass = document.getElementById("err-auth-password");

  errName.textContent = "";
  errEmail.textContent = "";
  errPass.textContent = "";

  let isValid = true;

  if (nameInput.length < 2) {
    errName.textContent = "Name must contain at least 2 characters.";
    isValid = false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(emailInput)) {
    errEmail.textContent = "Please enter a valid email address.";
    isValid = false;
  }

  if (passwordInput.length < 6) {
    errPass.textContent = "Password must be at least 6 characters long.";
    isValid = false;
  }

  if (!isValid) return;

  currentUser = {
    name: nameInput,
    email: emailInput,
    role: selectedRole
  };

  saveAllState();
  document.getElementById("auth-form").reset();
  closeModal("auth-modal");

  if (selectedRole === "admin") {
    switchView("admin");
  }
}

function handleLogout() {
  currentUser = null;
  saveAllState();
  switchView("catalogue");
}

/* ==========================================================================
   CATALOGUE RENDERING (SEARCH, FILTER, SORT)
   ========================================================================== */
function renderCatalogue() {
  const searchTerm = document.getElementById("search-input").value.trim().toLowerCase();
  const selectedCategory = document.getElementById("category-filter").value;
  const sortMode = document.getElementById("sort-select").value;

  let filteredList = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm);

    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (sortMode === "price-asc") {
    filteredList.sort((a, b) => a.price - b.price);
  } else if (sortMode === "price-desc") {
    filteredList.sort((a, b) => b.price - a.price);
  } else if (sortMode === "rating-desc") {
    filteredList.sort((a, b) => calculateAverageRating(b.reviews) - calculateAverageRating(a.reviews));
  }

  const grid = document.getElementById("product-grid");

  if (filteredList.length === 0) {
    grid.innerHTML = `<div class="panel" style="grid-column: 1 / -1; text-align: center;">
      <p>No products matched your current search or filter criteria.</p>
    </div>`;
    return;
  }

  grid.innerHTML = filteredList.map(product => {
    const avgRating = calculateAverageRating(product.reviews);
    const ratingBadge = avgRating > 0 ? `⭐ ${avgRating} (${product.reviews.length})` : "No reviews yet";
    const isSoldOut = product.stock <= 0;

    return `
      <article class="product-card">
        <div class="card-banner">
          <span class="cat-pill">${escapeHTML(product.category)}</span>
          <span class="cond-pill">${escapeHTML(product.condition || "Verified")}</span>
          <span aria-hidden="true">${escapeHTML(product.icon || "📦")}</span>
        </div>
        <div class="card-body">
          <h3>${escapeHTML(product.name)}</h3>
          <p class="card-desc">${escapeHTML(product.description)}</p>
          <div class="card-stats">
            <span>${ratingBadge}</span>
            <span>${isSoldOut ? '<strong style="color:var(--danger)">Out of Stock</strong>' : "Stock: " + product.stock}</span>
          </div>
          <div class="price-tag">${formatINR(product.price)}</div>
        </div>
        <div class="card-footer">
          <button type="button" class="btn btn-outline" onclick="openProductDetail(${product.id})">Details</button>
          <button type="button" class="btn btn-primary" ${isSoldOut ? "disabled" : ""} onclick="addToCart(${product.id})">
            ${isSoldOut ? "Sold Out" : "+ Add to Cart"}
          </button>
        </div>
      </article>
    `;
  }).join("");
}

/* ==========================================================================
   PRODUCT DETAILS & REVIEWS MODAL
   ========================================================================== */
function openProductDetail(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const avgRating = calculateAverageRating(product.reviews);
  const reviewsMarkup = product.reviews.length > 0
    ? product.reviews.map(rev => `
        <div class="review-card">
          <strong>${escapeHTML(rev.author)}</strong> &mdash; ${"⭐".repeat(rev.rating)}
          <p style="margin-top:0.25rem; color:var(--text-muted);">${escapeHTML(rev.comment)}</p>
        </div>
      `).join("")
    : `<p class="muted-text">No customer reviews yet. Submit the first review below!</p>`;

  const modalBody = document.getElementById("detail-modal-body");
  modalBody.innerHTML = `
    <button type="button" class="modal-close" aria-label="Close product details" onclick="closeModal('detail-modal')">&times;</button>
    <div style="font-size:3.2rem; text-align:center; background:var(--bg-muted); padding:1rem; border-radius:8px; margin-bottom:1rem;">
      ${escapeHTML(product.icon || "📦")}
    </div>
    <span class="cat-pill" style="position:static; display:inline-block; margin-bottom:0.5rem;">${escapeHTML(product.category)}</span>
    <h2 id="modal-prod-title">${escapeHTML(product.name)}</h2>
    <p class="price-tag" style="margin:0.4rem 0;">${formatINR(product.price)}</p>
    <p style="margin-bottom:0.75rem;">${escapeHTML(product.description)}</p>
    <p class="muted-text">
      Average Rating: <strong>${avgRating > 0 ? avgRating + " / 5" : "Not rated"}</strong> &bull;
      Available Units: <strong>${product.stock}</strong> &bull;
      Condition: <strong>${escapeHTML(product.condition || "Verified")}</strong>
    </p>

    <button type="button" class="btn btn-primary full-btn" ${product.stock <= 0 ? "disabled" : ""} onclick="addToCart(${product.id}); closeModal('detail-modal');">
      ${product.stock <= 0 ? "Out of Stock" : "Add Item to Cart"}
    </button>

    <hr style="border:none; border-top:1px solid #e2e8f0; margin:1.25rem 0;" />

    <h3>Customer Reviews (${product.reviews.length})</h3>
    ${reviewsMarkup}

    <form onsubmit="handleReviewSubmit(event, ${product.id})" style="margin-top:1rem; background:var(--bg-muted); padding:0.9rem; border-radius:8px;">
      <h4>Write a Product Review</h4>
      <div class="form-grid" style="margin-top:0.5rem;">
        <div class="form-field">
          <label for="review-rating">Rating</label>
          <select id="review-rating">
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Very Good</option>
            <option value="3">3 - Average</option>
            <option value="2">2 - Below Average</option>
            <option value="1">1 - Poor</option>
          </select>
        </div>
        <div class="form-field">
          <label for="review-comment">Comment *</label>
          <input type="text" id="review-comment" placeholder="Share your experience..." required />
        </div>
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%;">Submit Review</button>
    </form>
  `;

  document.getElementById("detail-modal").classList.remove("hidden");
}

function handleReviewSubmit(event, productId) {
  event.preventDefault();
  if (!currentUser) {
    alert("Please log in or register before posting a review.");
    closeModal("detail-modal");
    openAuthModal();
    return;
  }

  const ratingVal = Number(document.getElementById("review-rating").value);
  const commentVal = document.getElementById("review-comment").value.trim();

  if (commentVal.length < 3) {
    alert("Please enter a review comment of at least 3 characters.");
    return;
  }

  const product = products.find(p => p.id === productId);
  if (!product) return;

  product.reviews.unshift({
    author: currentUser.name,
    rating: ratingVal,
    comment: commentVal
  });

  saveAllState();
  openProductDetail(productId);
  renderCatalogue();
}

/* ==========================================================================
   CART MANAGEMENT & CHECKOUT WORKFLOW
   ========================================================================== */
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product || product.stock <= 0) return;

  const existingEntry = cart.find(item => item.productId === productId);
  if (existingEntry) {
    if (existingEntry.qty >= product.stock) {
      alert("You have reached the maximum available stock for this item.");
      return;
    }
    existingEntry.qty += 1;
  } else {
    cart.push({ productId: productId, qty: 1 });
  }

  saveAllState();
}

function changeCartQuantity(productId, delta) {
  const entry = cart.find(item => item.productId === productId);
  const product = products.find(p => p.id === productId);
  if (!entry || !product) return;

  const updatedQty = entry.qty + delta;
  if (updatedQty <= 0) {
    cart = cart.filter(item => item.productId !== productId);
  } else if (updatedQty > product.stock) {
    alert("Cannot exceed available inventory (" + product.stock + " units).");
    return;
  } else {
    entry.qty = updatedQty;
  }

  saveAllState();
  renderCart();
}

function renderCart() {
  const container = document.getElementById("cart-content");

  if (cart.length === 0) {
    container.innerHTML = `<article class="panel" style="text-align:center;">
      <p class="muted-text">Your shopping cart is currently empty.</p>
      <button type="button" class="btn btn-primary" style="max-width:220px;" onclick="switchView('catalogue')">Browse Catalogue</button>
    </article>`;
    return;
  }

  let subtotal = 0;

  const tableRows = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return "";
    const lineTotal = product.price * item.qty;
    subtotal += lineTotal;

    return `
      <tr>
        <td>${escapeHTML(product.icon || "📦")} <strong>${escapeHTML(product.name)}</strong></td>
        <td>${formatINR(product.price)}</td>
        <td>
          <button type="button" class="btn btn-outline" style="padding:0.2rem 0.6rem;" onclick="changeCartQuantity(${product.id}, -1)">-</button>
          <span style="margin:0 0.6rem; font-weight:700;">${item.qty}</span>
          <button type="button" class="btn btn-outline" style="padding:0.2rem 0.6rem;" onclick="changeCartQuantity(${product.id}, 1)">+</button>
        </td>
        <td><strong>${formatINR(lineTotal)}</strong></td>
        <td>
          <button type="button" class="btn btn-danger" style="padding:0.3rem 0.65rem;" onclick="changeCartQuantity(${product.id}, -${item.qty})">Remove</button>
        </td>
      </tr>
    `;
  }).join("");

  container.innerHTML = `
    <article class="panel">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Unit Price</th>
              <th scope="col">Quantity</th>
              <th scope="col">Subtotal</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>

      <div class="checkout-grid">
        <form id="checkout-form" onsubmit="handleCheckoutSubmit(event)">
          <h3>Campus Delivery &amp; Checkout</h3>
          <div class="form-field">
            <label for="delivery-hostel">Hostel Block / Campus Pickup Point *</label>
            <input type="text" id="delivery-hostel" placeholder="e.g., BH-4, Room 312 or Uni-Mall Gate" required />
          </div>
          <div class="form-field">
            <label for="contact-phone">Contact Phone Number *</label>
            <input type="text" id="contact-phone" placeholder="10-digit mobile number" pattern="[0-9]{10}" required />
          </div>
          <div class="form-field">
            <label for="payment-method">Payment Method</label>
            <select id="payment-method">
              <option value="UPI Scan on Delivery">UPI Scan on Delivery</option>
              <option value="Cash on Delivery">Cash on Delivery</option>
            </select>
          </div>
          <button type="submit" class="btn btn-success full-btn">Confirm &amp; Place Order</button>
        </form>

        <div class="summary-card">
          <h3>Order Summary</h3>
          <div class="summary-row">
            <span>Items Subtotal</span>
            <span>${formatINR(subtotal)}</span>
          </div>
          <div class="summary-row">
            <span>Campus Delivery</span>
            <span>FREE</span>
          </div>
          <div class="summary-row summary-total">
            <span>Total Payable</span>
            <span>${formatINR(subtotal)}</span>
          </div>
        </div>
      </div>
    </article>
  `;
}

function handleCheckoutSubmit(event) {
  event.preventDefault();

  if (!currentUser) {
    alert("Please log in or register to complete checkout.");
    openAuthModal();
    return;
  }

  const address = document.getElementById("delivery-hostel").value.trim();
  const phone = document.getElementById("contact-phone").value.trim();
  const payment = document.getElementById("payment-method").value;

  if (address.length < 4 || !/^[0-9]{10}$/.test(phone)) {
    alert("Please enter a valid delivery address and 10-digit phone number.");
    return;
  }

  let grandTotal = 0;
  const purchasedItems = [];

  cart.forEach(entry => {
    const product = products.find(p => p.id === entry.productId);
    if (product) {
      product.stock = Math.max(0, product.stock - entry.qty);
      grandTotal += product.price * entry.qty;
      purchasedItems.push({
        name: product.name,
        qty: entry.qty,
        price: product.price
      });
    }
  });

  const newOrder = {
    id: "CM-" + Math.floor(100000 + Math.random() * 900000),
    customerName: currentUser.name,
    customerEmail: currentUser.email,
    date: new Date().toLocaleString("en-IN"),
    address: address,
    phone: phone,
    payment: payment,
    total: grandTotal,
    status: "Confirmed",
    items: purchasedItems
  };

  orders.unshift(newOrder);
  cart = [];
  saveAllState();

  alert("Order " + newOrder.id + " confirmed! Thank you for shopping on CampusMart.");
  switchView("orders");
}

/* ==========================================================================
   ORDER HISTORY VIEW
   ========================================================================== */
function renderOrders() {
  const container = document.getElementById("orders-content");

  if (orders.length === 0) {
    container.innerHTML = `<article class="panel" style="text-align:center;">
      <p class="muted-text">No orders found yet. Add products to your cart to place your first order.</p>
    </article>`;
    return;
  }

  container.innerHTML = orders.map(order => `
    <article class="order-card">
      <div class="order-top">
        <div>
          <strong>Order #${escapeHTML(order.id)}</strong>
          <span class="muted-text"> &bull; ${escapeHTML(order.date)}</span>
        </div>
        <span class="status-pill">${escapeHTML(order.status)}</span>
      </div>
      <p style="font-size:0.9rem;">
        <strong>Customer:</strong> ${escapeHTML(order.customerName)} (${escapeHTML(order.phone)}) &bull;
        <strong>Delivery:</strong> ${escapeHTML(order.address)} &bull;
        <strong>Payment:</strong> ${escapeHTML(order.payment)}
      </p>
      <ul class="styled-list">
        ${order.items.map(i => `<li>${escapeHTML(i.name)} &times; ${i.qty} &mdash; ${formatINR(i.price * i.qty)}</li>`).join("")}
      </ul>
      <p style="font-weight:700; color:var(--primary); margin-top:0.5rem;">Total Paid: ${formatINR(order.total)}</p>
    </article>
  `).join("");
}

/* ==========================================================================
   ADMIN CRUD OPERATIONS (CREATE, READ, UPDATE, DELETE)
   ========================================================================== */
function renderAdminTable() {
  const tbody = document.getElementById("admin-table-body");

  tbody.innerHTML = products.map(p => {
    const avg = calculateAverageRating(p.reviews);
    return `
      <tr>
        <td>#${p.id}</td>
        <td>${escapeHTML(p.icon || "📦")} <strong>${escapeHTML(p.name)}</strong></td>
        <td>${escapeHTML(p.category)}</td>
        <td>${formatINR(p.price)}</td>
        <td>${p.stock}</td>
        <td>${avg > 0 ? "⭐ " + avg : "N/A"}</td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            <button type="button" class="btn btn-outline" style="padding:0.3rem 0.65rem;" onclick="populateAdminEdit(${p.id})">Edit</button>
            <button type="button" class="btn btn-danger" style="padding:0.3rem 0.65rem;" onclick="deleteProduct(${p.id})">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function handleAdminFormSubmit(event) {
  event.preventDefault();

  const editId = document.getElementById("edit-id").value;
  const name = document.getElementById("prod-name").value.trim();
  const category = document.getElementById("prod-category").value;
  const price = Number(document.getElementById("prod-price").value);
  const stock = Number(document.getElementById("prod-stock").value);
  const condition = document.getElementById("prod-badge").value.trim() || "Verified";
  const icon = document.getElementById("prod-icon").value.trim() || "📦";
  const description = document.getElementById("prod-desc").value.trim();

  document.getElementById("err-prod-name").textContent = "";
  document.getElementById("err-prod-price").textContent = "";
  document.getElementById("err-prod-stock").textContent = "";
  document.getElementById("err-prod-desc").textContent = "";

  let valid = true;

  if (name.length < 3) {
    document.getElementById("err-prod-name").textContent = "Product name must be at least 3 characters.";
    valid = false;
  }
  if (!Number.isFinite(price) || price <= 0) {
    document.getElementById("err-prod-price").textContent = "Enter a valid positive price.";
    valid = false;
  }
  if (!Number.isInteger(stock) || stock < 0) {
    document.getElementById("err-prod-stock").textContent = "Stock must be 0 or a positive integer.";
    valid = false;
  }
  if (description.length < 10) {
    document.getElementById("err-prod-desc").textContent = "Description must be at least 10 characters.";
    valid = false;
  }

  if (!valid) return;

  if (editId) {
    const idx = products.findIndex(p => p.id === Number(editId));
    if (idx !== -1) {
      products[idx] = {
        ...products[idx],
        name,
        category,
        price,
        stock,
        condition,
        icon,
        description
      };
    }
  } else {
    const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1001;
    products.unshift({
      id: nextId,
      name,
      category,
      price,
      stock,
      condition,
      icon,
      description,
      reviews: []
    });
  }

  saveAllState();
  resetAdminForm();
  renderAdminTable();
  renderCatalogue();
}

function populateAdminEdit(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  document.getElementById("admin-form-title").textContent = "Edit Product #" + product.id;
  document.getElementById("edit-id").value = product.id;
  document.getElementById("prod-name").value = product.name;
  document.getElementById("prod-category").value = product.category;
  document.getElementById("prod-price").value = product.price;
  document.getElementById("prod-stock").value = product.stock;
  document.getElementById("prod-badge").value = product.condition || "";
  document.getElementById("prod-icon").value = product.icon || "";
  document.getElementById("prod-desc").value = product.description;

  document.getElementById("admin-form").scrollIntoView({ behavior: "smooth" });
}

function deleteProduct(productId) {
  if (!confirm("Are you sure you want to permanently delete this product?")) return;
  products = products.filter(p => p.id !== productId);
  cart = cart.filter(c => c.productId !== productId);
  saveAllState();
  renderAdminTable();
  renderCatalogue();
}

function resetAdminForm() {
  document.getElementById("admin-form-title").textContent = "Add New Product";
  document.getElementById("edit-id").value = "";
  document.getElementById("admin-form").reset();
}

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
syncHeaderUI();
renderCatalogue();
