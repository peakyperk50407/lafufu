// Basic hi-fi shop logic: products, SEK pricing, login-only password, and cart

// Example products with Google image URLs (for demo purposes)
const products = [
  {
    id: 'lafufu-fig-01',
    title: 'Lafufu Figur – Classic',
    priceSEK: 349,
    imageUrl: './1.jpg',
  },
  {
    id: 'lafufu-plush-02',
    title: 'Lafufu Mjukis – Rosa Edition',
    priceSEK: 299,
    imageUrl: './2.png',
  },
  {
    id: 'lafufu-art-03',
    title: 'Lafufu Poster – Midnight',
    priceSEK: 199,
    imageUrl: './3.png',
  },
  {
    id: 'lafufu-fig-04',
    title: 'Lafufu Figur – Neon Drop',
    priceSEK: 399,
    imageUrl: './4.png',
  },
  {
    id: 'lafufu-tee-05',
    title: 'Lafufu T-shirt – Shadow',
    priceSEK: 249,
    imageUrl: './5.png',
  },
];

// Helpers
const formatSEK = (value) => new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(value);

const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => Array.from(document.querySelectorAll(sel));

// Render products
function renderProducts() {
  const container = qs('#products');
  container.innerHTML = products
    .map((p) => {
      return `
      <article class="card" data-id="${p.id}">
        <div class="media">
          <img alt="${p.title}" src="${p.imageUrl}" loading="lazy" />
        </div>
        <div class="content">
          <div class="title">${p.title}</div>
          <div class="row" style="justify-content: space-between;">
            <span class="price">${formatSEK(p.priceSEK)}</span>
            <button class="btn primary add-to-cart" data-id="${p.id}">Lägg i korg</button>
          </div>
          <p class="muted">Lafufu‑stil med minimalistisk estetik och samlarvärde.</p>
        </div>
      </article>
    `;
    })
    .join('');
}

// Cart state
const cart = new Map(); // id -> { product, qty }

function updateCartCount() {
  const count = Array.from(cart.values()).reduce((acc, v) => acc + v.qty, 0);
  qs('#cartCount').textContent = String(count);
}

function renderCart() {
  const itemsEl = qs('#cartItems');
  const entries = Array.from(cart.values());
  if (entries.length === 0) {
    itemsEl.innerHTML = '<p class="muted">Din varukorg är tom.</p>';
  } else {
    itemsEl.innerHTML = entries
      .map(({ product, qty }) => `
        <div class="cart-item" data-id="${product.id}">
          <img src="${product.imageUrl}" alt="${product.title}" />
          <div>
            <div class="title">${product.title}</div>
            <div class="muted">${qty} × ${formatSEK(product.priceSEK)}</div>
          </div>
          <div class="row">
            <button class="icon-btn" data-action="dec">−</button>
            <button class="icon-btn" data-action="inc">+</button>
            <button class="icon-btn" data-action="rm">✕</button>
          </div>
        </div>
      `)
      .join('');
  }

  const total = entries.reduce((acc, { product, qty }) => acc + product.priceSEK * qty, 0);
  qs('#cartTotal').textContent = formatSEK(total);
}

function addToCart(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;
  const existing = cart.get(id);
  if (existing) existing.qty += 1; else cart.set(id, { product, qty: 1 });
  updateCartCount();
  renderCart();
}

function changeQty(id, delta) {
  const item = cart.get(id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart.delete(id);
  updateCartCount();
  renderCart();
}

function removeItem(id) {
  cart.delete(id);
  updateCartCount();
  renderCart();
}

// Login modal logic (password-only)
const PASSWORD = 'LVT905'; // demo-only per request
function openLogin() {
  qs('#loginModal').classList.remove('hidden');
  qs('#passwordInput').focus();
}
function closeLogin() {
  qs('#loginModal').classList.add('hidden');
  qs('#loginStatus').textContent = '';
  qs('#passwordInput').value = '';
}
function confirmLogin() {
  const val = qs('#passwordInput').value.trim();
  if (val === PASSWORD) {
    const link = 'https://drive.google.com/file/d/1GlwJQdEHhBey0nUnb9icRCKM-FV9yv-j/view?usp=sharing;
    try {
      window.open(link, '_blank');
    } catch (e) {
      // Fallback: show clickable link
    }
    qs('#loginStatus').style.color = '#4caf50';
    qs('#loginStatus').innerHTML = `Länk öppnad. Om inte, <a href="${link}" target="_blank" rel="noopener">klicka här</a>.`;
    setTimeout(closeLogin, 1200);
  } else {
    qs('#loginStatus').style.color = '#ef476f';
    qs('#loginStatus').textContent = 'Fel lösenord.';
  }
}

// Drawer
function openCart() { qs('#cartDrawer').classList.remove('hidden'); }
function closeCart() { qs('#cartDrawer').classList.add('hidden'); }

// Event wiring
function wireEvents() {
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.matches('.add-to-cart')) {
      addToCart(t.dataset.id);
    }
    if (t.matches('#loginBtn')) openLogin();
    if (t.matches('#cartBtn')) { renderCart(); openCart(); }
    if (t.matches('#confirmLogin')) confirmLogin();
    if (t.matches('#cancelLogin')) closeLogin();
    if (t.matches('#closeCart')) closeCart();
    if (t.closest('.cart-item') && t.matches('.icon-btn')) {
      const id = t.closest('.cart-item').dataset.id;
      const action = t.dataset.action;
      if (action === 'inc') changeQty(id, +1);
      if (action === 'dec') changeQty(id, -1);
      if (action === 'rm') removeItem(id);
    }
    if (t.matches('#checkoutBtn')) {
      alert('Kassa (demo): Tack för din beställning!');
      closeCart();
    }
  });

  // Close modal/drawer when clicking backdrop
  qs('#loginModal').addEventListener('click', (e) => {
    if (e.target.id === 'loginModal') closeLogin();
  });
  qs('#cartDrawer').addEventListener('click', (e) => {
    if (e.target.id === 'cartDrawer') closeCart();
  });
}

// Init
renderProducts();
wireEvents();
