// ========== Utilities ==========
const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));
const fmt = (n) => "$" + n.toFixed(2);

// ========== Mock catalog ==========
const PRODUCTS = [
  {
    id: 1,
    title: "Lenovo Tab M10 HD",
    brand: "Lenovo",
    os: "Android",
    storage: 32,
    price: 229.99,
    old: 259.99,
    rating: 4.3,
    reviews: 128,
    tags: ["android"],
    badge: "HOT",
  },
  {
    id: 2,
    title: 'Teclast M40 Pro 10"',
    brand: "Teclast",
    os: "Android",
    storage: 128,
    price: 179.99,
    old: 219.99,
    rating: 4.6,
    reviews: 76,
    tags: ["android", "kids"],
    badge: "-25%",
  },
  {
    id: 3,
    title: "Samsung Tab A9+",
    brand: "Samsung",
    os: "Android",
    storage: 64,
    price: 265.0,
    rating: 4.5,
    reviews: 220,
    tags: ["android"],
    badge: "BEST",
  },
  {
    id: 4,
    title: 'iPad 9th Gen 10.2"',
    brand: "Apple",
    os: "iOS",
    storage: 64,
    price: 329.0,
    rating: 4.8,
    reviews: 180,
    tags: [],
    badge: "NEW",
  },
  {
    id: 5,
    title: "Microsoft Surface Go",
    brand: "Microsoft",
    os: "Windows",
    storage: 128,
    price: 421.79,
    old: 499.0,
    rating: 4.1,
    reviews: 51,
    tags: ["windows"],
  },
  {
    id: 6,
    title: "Lenovo IdeaPad D330",
    brand: "Lenovo",
    os: "Windows",
    storage: 128,
    price: 315.9,
    rating: 4.2,
    reviews: 33,
    tags: ["windows"],
  },
  {
    id: 7,
    title: "Blackview Tab 12",
    brand: "Blackview",
    os: "Android",
    storage: 64,
    price: 169.99,
    rating: 4.0,
    reviews: 40,
    tags: ["android"],
  },
  {
    id: 8,
    title: "ALLDOCUBE iPlay 50",
    brand: "Alldocube",
    os: "Android",
    storage: 128,
    price: 116.6,
    rating: 4.1,
    reviews: 102,
    tags: ["android"],
    badge: "Deal",
  },
  {
    id: 9,
    title: "Acer One 10 T4-129L",
    brand: "Acer",
    os: "Android",
    storage: 64,
    price: 232.99,
    rating: 3.9,
    reviews: 18,
    tags: ["android"],
  },
  {
    id: 10,
    title: "Xiaomi Pad 6",
    brand: "Xiaomi",
    os: "Android",
    storage: 128,
    price: 369.99,
    old: 399.99,
    rating: 4.7,
    reviews: 412,
    tags: ["android", "new"],
    badge: "-8%",
  },
  {
    id: 11,
    title: "CHUWI Hi10 X Pro",
    brand: "Chuwi",
    os: "Windows",
    storage: 256,
    price: 1025.0,
    rating: 4.3,
    reviews: 12,
    tags: ["windows"],
  },
  {
    id: 12,
    title: "Lenovo Yoga Book 9i",
    brand: "Lenovo",
    os: "Windows",
    storage: 256,
    price: 1350.0,
    rating: 4.9,
    reviews: 9,
    tags: ["windows"],
  },
  {
    id: 13,
    title: "Honor Pad X9",
    brand: "Honor",
    os: "Android",
    storage: 128,
    price: 199.99,
    rating: 4.4,
    reviews: 90,
    tags: ["android"],
  },
  {
    id: 14,
    title: "Huawei MatePad 11",
    brand: "Huawei",
    os: "Android",
    storage: 128,
    price: 299.99,
    rating: 4.6,
    reviews: 210,
    tags: ["android"],
  },
  {
    id: 15,
    title: "Nokia T20",
    brand: "Nokia",
    os: "Android",
    storage: 64,
    price: 169.0,
    rating: 4.0,
    reviews: 70,
    tags: ["android", "kids"],
  },
];

// Derived brand facet
const BRANDS = [...new Set(PRODUCTS.map((p) => p.brand))].sort();

// ========== State ==========
let page = 1;
const PER_PAGE = 9;
let filtered = PRODUCTS.slice();
let recently = [];
const CART = [];
const LIKES = new Set();

// ========== Helpers ==========
function placeholderSvg(text) {
  const safe = String(text).replace(
    /[&<>]/g,
    (s) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[s])
  );
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360" aria-hidden="true" focusable="false">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e5e7eb"/><stop offset="1" stop-color="#f3f4f6"/></linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
          font-family="sans-serif" font-size="22" fill="#9ca3af">${safe}</text>
  </svg>`;
}

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("is-visible");
  clearTimeout(window.__toast);
  window.__toast = setTimeout(() => {
    t.classList.remove("is-visible");
    t.textContent = "";
  }, 1400);
}

function updateCategoryActive(brand) {
  const allBtn = document.getElementById("allCats");
  if (allBtn) allBtn.classList.toggle("active", !brand);
  document.querySelectorAll("#brandNav a").forEach((a) => {
    a.classList.toggle("active", a.dataset.brand === brand);
  });
}

// ========== Renderers ==========
function productCard(p) {
  const stars = Math.round(p.rating);
  return `<article class="card" data-id="${p.id}">
    <div class="thumb">
      ${placeholderSvg(p.title)}
      <div class="badges">
        ${p.badge ? `<span class="badge badge--deal">${p.badge}</span>` : ""}
      </div>
    </div>
    <a href="#" class="title">${p.title}</a>
    <div class="meta">${p.brand} • ${p.os} • ${p.storage}GB</div>
    <div class="rating"><span class="stars">${"★".repeat(stars)}</span><span>(${
    p.reviews
  })</span></div>
    <div class="price">
      <div class="price__new">${fmt(p.price)}</div>
      ${p.old ? `<div class="price__old">${fmt(p.old)}</div>` : ""}
    </div>
    <div class="add">
      <button class="btn btn--brand" data-add="${
        p.id
      }" type="button">Add to cart</button>
      <button class="btn btn--icon like-btn" data-like="${
        p.id
      }" aria-pressed="false" title="Add to wishlist" type="button">
        <i class="fa-regular fa-heart" aria-hidden="true"></i>
      </button>
    </div>
  </article>`;
}

function renderGrid() {
  const grid = $("#grid");
  const start = (page - 1) * PER_PAGE;
  const slice = filtered.slice(start, start + PER_PAGE);
  grid.innerHTML = slice.map(productCard).join("");

  $(
    "#resultsCount"
  ).textContent = `Showing ${slice.length} of ${filtered.length} results`;
  $("#showMore").style.display =
    start + PER_PAGE < filtered.length ? "inline-grid" : "none";

  renderPagination();
  updateLikesUI();
  renderLikesDropdown();
}

function renderPagination() {
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const nums = $("#pageNums");
  nums.innerHTML = "";

  for (let i = 1; i <= pages && i <= 6; i++) {
    const b = document.createElement("button");
    b.className = "page" + (i === page ? " active" : "");
    b.textContent = i;
    b.addEventListener("click", () => {
      page = i;
      renderGrid();
    });
    nums.appendChild(b);
  }

  $("#prevPage").onclick = () => {
    if (page > 1) {
      page--;
      renderGrid();
    }
  };
  $("#nextPage").onclick = () => {
    if (page < pages) {
      page++;
      renderGrid();
    }
  };
}

function renderRecent() {
  const row = $("#recentRow");
  row.innerHTML = recently
    .slice(-10)
    .reverse()
    .map((id) => {
      const p = PRODUCTS.find((x) => x.id === id);
      return `<article class="card">
      <div class="thumb">${placeholderSvg(p.title)}</div>
      <a class="title" href="#">${p.title}</a>
      <div class="price"><div class="price__new">${fmt(p.price)}</div></div>
    </article>`;
    })
    .join("");
}

// ========== Filters & sorting ==========
function applyFilters() {
  const brands = $$("input[name=brand]:checked").map((i) => i.value);
  const os = $$("input[name=os]:checked").map((i) => i.value);
  const stor = $$("input[name=storage]:checked").map((i) => +i.value);

  updateCategoryActive(brands[0] || null);

  const minP = parseFloat($("#minPrice")?.value ?? 0) || 0;
  const maxP = parseFloat($("#maxPrice")?.value ?? Infinity) || Infinity;

  filtered = PRODUCTS.filter(
    (p) =>
      (!brands.length || brands.includes(p.brand)) &&
      (!os.length || os.includes(p.os)) &&
      (!stor.length || stor.includes(p.storage)) &&
      p.price >= minP &&
      p.price <= maxP
  );

  applySort();
  page = 1;
  renderGrid();
}

function applySort() {
  const s = $("#sort").value;
  const cmp = {
    pop: (a, b) => b.reviews - a.reviews,
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    "rating-desc": (a, b) => b.rating - a.rating,
  }[s];
  filtered.sort(cmp);
}

// ========== Cart ==========
function addToCart(id) {
  const f = CART.find((x) => x.id === id);
  if (f) f.qty += 1;
  else CART.push({ id, qty: 1 });
  updateCartUI();
  toast("Added to cart");
}

function updateCartUI() {
  const qty = CART.reduce((s, i) => s + i.qty, 0);
  $("#cartQty").textContent = qty;

  const list = $("#cartList");
  list.innerHTML = CART.map((item) => {
    const p = PRODUCTS.find((x) => x.id === item.id);
    return `<div class="cart__item">
      <div class="cart__thumb">IMG</div>
      <div>${p.title}<div class="meta">${item.qty} × ${fmt(p.price)}</div></div>
      <button class="btn btn--sm" data-rem="${p.id}" type="button">–</button>
    </div>`;
  }).join("");

  $("#cartTotal").textContent = fmt(
    CART.reduce((s, i) => {
      const p = PRODUCTS.find((x) => x.id === i.id);
      return s + p.price * i.qty;
    }, 0)
  );
}

function removeFromCart(id) {
  const idx = CART.findIndex((x) => x.id === id);
  if (idx > -1) {
    if (CART[idx].qty > 1) CART[idx].qty -= 1;
    else CART.splice(idx, 1);
    updateCartUI();
  }
}

// ========== Likes (wishlist) ==========
function updateLikesUI() {
  const el = document.getElementById("wishQty");
  if (el) el.textContent = LIKES.size;

  document.querySelectorAll("[data-like]").forEach((b) => {
    const id = +b.dataset.like;
    const active = LIKES.has(id);
    b.classList.toggle("active", active);
    b.setAttribute("aria-pressed", String(active));
    const i = b.querySelector("i");
    if (i) i.className = active ? "fa-solid fa-heart" : "fa-regular fa-heart";
  });
}

function toggleLike(id) {
  LIKES.has(id) ? LIKES.delete(id) : LIKES.add(id);
  updateLikesUI();
  renderLikesDropdown();
}

function renderLikesDropdown() {
  const list = document.getElementById("wishList");
  if (!list) return;

  if (!LIKES.size) {
    list.innerHTML = `<div class="wish__empty">No liked items yet</div>`;
    return;
  }

  list.innerHTML = Array.from(LIKES)
    .map((id) => {
      const p = PRODUCTS.find((x) => x.id === id);
      return `<div class="wish__item">
      <div class="wish__thumb">IMG</div>
      <div>${p.title}<div class="meta">${fmt(p.price)}</div></div>
      <button class="btn btn--sm" data-unlike="${
        p.id
      }" aria-label="Remove" type="button">×</button>
    </div>`;
    })
    .join("");
}

// ========== Events ==========
document.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  const like = e.target.closest("[data-like]");
  const rem = e.target.closest("[data-rem]");
  const unlike = e.target.closest("[data-unlike]");
  const card = e.target.closest(".card");

  if (add) {
    addToCart(+add.dataset.add);
    e.stopPropagation();
    return;
  }
  if (like) {
    toggleLike(+like.dataset.like);
    e.stopPropagation();
    return;
  }
  if (rem) {
    removeFromCart(+rem.dataset.rem);
    e.stopPropagation();
    return;
  }
  if (unlike) {
    LIKES.delete(+unlike.dataset.unlike);
    updateLikesUI();
    renderLikesDropdown();
    e.stopPropagation();
    return;
  }

  if (card) {
    const alreadyOpen = card.classList.contains("card--open");
    document
      .querySelectorAll(".card.card--open")
      .forEach((c) => c.classList.remove("card--open"));
    if (!alreadyOpen) card.classList.add("card--open");

    card.classList.add("card--viewed");
    const id = +card.dataset.id;
    if (!recently.includes(id)) {
      recently.push(id);
      renderRecent();
    }
  }
});

// wishlist dropdown toggle
document.getElementById("wishBtn").addEventListener("click", (e) => {
  e.stopPropagation();
  const dd = document.getElementById("wishDropdown");
  renderLikesDropdown();
  dd.style.display = dd.style.display === "block" ? "none" : "block";
});

// close wishlist on outside click
document.addEventListener("click", (e) => {
  if (!e.target.closest(".wish")) {
    const dd = document.getElementById("wishDropdown");
    if (dd) dd.style.display = "none";
  }
});

// search
document.getElementById("searchBtn").addEventListener("click", () => {
  const q = document.getElementById("q").value.toLowerCase().trim();
  filtered = PRODUCTS.filter(
    (p) =>
      p.title.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
  );
  applySort();
  page = 1;
  renderGrid();
});

// cart dropdown
document.getElementById("cartBtn").addEventListener("click", () => {
  const dd = document.getElementById("cartDropdown");
  dd.style.display = dd.style.display === "block" ? "none" : "block";
});

// brand quick filter via navbar
document.getElementById("brandNav").addEventListener("click", (e) => {
  const a = e.target.closest("a[data-brand]");
  if (!a) return;
  e.preventDefault();
  const brand = a.dataset.brand;
  const boxes = $$("input[name=brand]");

  if (boxes.length) {
    boxes.forEach((i) => (i.checked = i.value === brand));
    updateCategoryActive(brand);
    applyFilters();
  } else {
    filtered = PRODUCTS.filter((p) => p.brand === brand);
    updateCategoryActive(brand);
    applySort();
    page = 1;
    renderGrid();
  }
});

// all categories button
const allBtn = document.getElementById("allCats");
allBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  $$("input[name=brand]").forEach((i) => (i.checked = false));
  updateCategoryActive(null);
  applyFilters();
});

// sort
document.getElementById("sort").addEventListener("change", () => {
  applySort();
  renderGrid();
});

// chips from checkbox selections
const chipBox = document.getElementById("activeChips");
const clearBtn = document.getElementById("clearAll");

document.addEventListener("change", (e) => {
  const cb = e.target.closest(".check-list input[type=checkbox]");
  if (!cb) return;
  cb.parentElement.classList.toggle("active", cb.checked);
  cb.checked ? addChip(cb) : removeChip(cb.value);
  applyFilters();
});

function addChip(cb) {
  if ([...chipBox.children].some((c) => c.dataset.val === cb.value)) return;
  const chip = document.createElement("span");
  chip.className = "chip";
  chip.dataset.val = cb.value;
  chip.innerHTML = `${cb.value} <button aria-label="Remove" type="button">×</button>`;
  chip.querySelector("button").onclick = () => {
    uncheck(cb.value);
    applyFilters();
  };
  chipBox.appendChild(chip);
}

function removeChip(val) {
  [...chipBox.children].find((c) => c.dataset.val === val)?.remove();
}

function uncheck(val) {
  const box = document.querySelector(
    `.check-list input[value="${CSS.escape(val)}"]`
  );
  if (box) {
    box.checked = false;
    removeChip(val);
  }
}

clearBtn.onclick = () => {
  $$(".check-list input[type=checkbox]").forEach((cb) => (cb.checked = false));
  chipBox.innerHTML = "";
  applyFilters();
};

// dual price slider -> inputs -> filter
let rangeMin = 0;
const range = document.querySelector(".range-selected");
const rangeInput = document.querySelectorAll(".range-input input");
const rangePrice = document.querySelectorAll(".range-price input");

rangeInput.forEach((input) => {
  input.addEventListener("input", (e) => {
    const minRange = parseInt(rangeInput[0].value);
    const maxRange = parseInt(rangeInput[1].value);

    if (maxRange - minRange < rangeMin) {
      if (e.target.className === "min")
        rangeInput[0].value = maxRange - rangeMin;
      else rangeInput[1].value = minRange + rangeMin;
    } else {
      rangePrice[0].value = minRange;
      rangePrice[1].value = maxRange;
      range.style.left = (minRange / rangeInput[0].max) * 100 + "%";
      range.style.right = 100 - (maxRange / rangeInput[1].max) * 100 + "%";
    }
    document.getElementById("minPrice").value = rangePrice[0].value;
    document.getElementById("maxPrice").value = rangePrice[1].value;
    applyFilters();
  });
});

rangePrice.forEach((input) => {
  input.addEventListener("input", (e) => {
    const minPrice = +rangePrice[0].value;
    const maxPrice = +rangePrice[1].value;
    if (maxPrice - minPrice >= rangeMin && maxPrice <= +rangeInput[1].max) {
      if (e.target === rangePrice[0]) {
        rangeInput[0].value = minPrice;
        range.style.left = (minPrice / rangeInput[0].max) * 100 + "%";
      } else {
        rangeInput[1].value = maxPrice;
        range.style.right = 100 - (maxPrice / rangeInput[1].max) * 100 + "%";
      }
      document.getElementById("minPrice").value = minPrice;
      document.getElementById("maxPrice").value = maxPrice;
      applyFilters();
    }
  });
});

// ========== Init ==========
function renderBrandFacet() {
  const box = document.getElementById("facetBrand");
  if (!box) return;
  box.innerHTML = BRANDS.map(
    (b) =>
      `<label class="check"><input type="checkbox" name="brand" value="${b}"><span>${b}</span></label>`
  ).join("");
}

renderBrandFacet();
applyFilters();
renderRecent();
updateCartUI();
updateLikesUI();
