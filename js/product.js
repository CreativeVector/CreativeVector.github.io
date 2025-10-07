const supabaseUrl = 'https://lekxtacqnusomlvtfxcz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxla3h0YWNxbnVzb21sdnRmeGN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDU0OTIsImV4cCI6MjA2NTU4MTQ5Mn0.mUGy47EGjDxWKWFl4EPWgYfYnzKB9YaTTYgmRihRQXU';
const tableName = 'StorePreview';
let supabase;

// --- UMANI TRACKING INITIALIZATION ---
function trackUmamiEvent(eventName, details = {}) {
  try {
    if (window.umami && typeof window.umami.track === 'function') {
      window.umami.track(eventName, details);
      console.log('[Umami]', eventName, details);
    } else {
      console.warn('[Umami] Tracker not loaded yet');
    }
  } catch (err) {
    console.error('[Umami] Tracking failed', err);
  }
}

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const query = {
    page: parseInt(params.get('page')) || 1,
    category: params.get('category') || '',
    titleFilter: params.get('filter_title') || '',
    keywordFilter: params.get('filter_keyword') || '',
    filenameFilter: params.get('filter_filename') || '',
    minPrice: params.has('min_price') ? parseFloat(params.get('min_price')) : null,
    maxPrice: params.has('max_price') ? parseFloat(params.get('max_price')) : null
  };

  // === Tambahan untuk Canonical Tag ===
  try {
    const canonicalBase = window.location.origin + window.location.pathname;

    // Pilih parameter penting yang boleh ada di canonical
    const allowedParams = ['category', 'page', 'filter_keyword', 'filter_title', 'filter_filename'];
    const canonicalParams = [];

    for (const [key, value] of params) {
      if (allowedParams.includes(key) && value) {
        canonicalParams.push(`${key}=${encodeURIComponent(value)}`);
      }
    }

    // Bangun canonical URL
    let canonicalUrl = canonicalBase;
    if (canonicalParams.length > 0) {
      canonicalUrl += '?' + canonicalParams.join('&');
    }

    // Perbarui atau buat canonical tag di <head>
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonicalUrl;
  } catch (err) {
    console.warn('Failed to update canonical tag:', err);
  }

  return query;
}


function updateURLParams(page, category, titleFilter, keywordFilter, filenameFilter, minPrice, maxPrice) {
  const params = new URLSearchParams();

  // Tambahkan parameter hanya jika ada nilainya
  if (page && page > 1) params.set('page', page);
  if (category) params.set('category', category);
  if (titleFilter) params.set('filter_title', titleFilter);
  if (keywordFilter) params.set('filter_keyword', keywordFilter);
  if (filenameFilter) params.set('filter_filename', filenameFilter);
  if (minPrice !== null && !isNaN(minPrice)) params.set('min_price', minPrice.toString());
  if (maxPrice !== null && !isNaN(maxPrice)) params.set('max_price', maxPrice.toString());

  // Buat URL baru
  const newQuery = params.toString();
  const newUrl = newQuery ? `${window.location.pathname}?${newQuery}` : window.location.pathname;

  // Perbarui URL tanpa reload halaman
  window.history.replaceState({}, '', newUrl);

  // === Tambahan opsional: perbarui canonical otomatis ===
  try {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }

    const canonicalBase = window.location.origin + window.location.pathname;
    const allowedParams = ['category', 'page', 'filter_keyword', 'filter_title', 'filter_filename'];
    const canonicalParams = [];

    for (const [key, value] of params) {
      if (allowedParams.includes(key) && value) {
        canonicalParams.push(`${key}=${encodeURIComponent(value)}`);
      }
    }

    let canonicalUrl = canonicalBase;
    if (canonicalParams.length > 0) {
      canonicalUrl += '?' + canonicalParams.join('&');
    }

    link.href = canonicalUrl;
  } catch (err) {
    console.warn('Failed to update canonical tag:', err);
  }
}


let allProducts = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let activeCategory = '';
let selectedLicense = 'personal';
let currentPage = 1;
const itemsPerPage = 24;
let totalPagesDisplay;
let pageInput;
let goToPageButton;
let previewImageContainer;
let currentPreviewTimeout;
let currentCurrency = localStorage.getItem('currentCurrency') || 'USD';

// Filter specific variables (now all active at once)
let currentTitleFilter = '';
let currentKeywordFilter = '';
let currentFilenameFilter = '';
let minPriceFilter = null;
let maxPriceFilter = null;

// For dropdown functionality
let isFilterMenuOpen = false;


const cartIcon = document.getElementById("cartIcon");
const cartModal = document.getElementById('cartModal');
const cartList = document.getElementById('cartList');
const cartTotal = document.getElementById('cartTotal');
const clearCartBtn = document.getElementById('clearCartBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const previewModal = document.getElementById('previewModal');
const previewImage = document.getElementById('previewImage');
const previewTitle = document.getElementById('previewTitle');
const previewDesc = document.getElementById('previewDesc');
const previewFilename = document.getElementById('previewFilename');
const previewPrice1 = document.getElementById('previewPrice1');
const previewPrice2 = document.getElementById('previewPrice2');
const previewPrice3 = document.getElementById('previewPrice3');
const previewIcon1 = document.getElementById('previewIcon1');
const previewIcon2 = document.getElementById('previewIcon2');
const storeDiv = document.getElementById('store');
const licenseSelector = document.getElementById('licenseSelector');
const categoryTabsContainer = document.getElementById('categoryTabs');
const cartCountSpan = document.querySelector('.cart-count');
const paginationControls = document.getElementById('pagination-controls');
const currToggle = document.getElementById('currToggle');
const searchResultCount = document.getElementById('searchResultCount');

// Filter DOM elements (all now directly visible)
const titleFilterInput = document.getElementById('titleFilterInput');
const keywordFilterInput = document.getElementById('keywordFilterInput');
const filenameFilterInput = document.getElementById('filenameFilterInput');
const minPriceInput = document.getElementById('minPriceInput');
const maxPriceInput = document.getElementById('maxPriceInput');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');


// Dropdown menu elements
const toggleFilterMenuBtn = document.getElementById('toggleFilterMenuBtn');
const closeFilterMenuBtn = document.getElementById('closeFilterMenuBtn');
const filterControlsWrapper = document.querySelector('.filter-controls-wrapper');
const sortSelect = document.getElementById('sortSelect');

let filterLikedOnly = false;
let filterWishlistOnly = false;

if (sortSelect) {
  // panggil ulang render saat user ganti opsi sort
  sortSelect.addEventListener('change', () => {
    currentPage = 1;
    updateURLParams(); // jika kamu menyimpan sort di URL
    renderProducts();
  });
}

totalPagesDisplay = document.createElement('span');
totalPagesDisplay.id = 'totalPagesDisplay';
totalPagesDisplay.style.marginRight = '15px';

cartIcon.addEventListener("click", showCart);
clearCartBtn.addEventListener("click", clearCart);
checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    showAlert("Your cart is empty. Please add some items before checking out.", "info");
    return;
  }

  location.href = '/checkout.html';
});
window.addEventListener('click', (event) => {
  if (event.target === cartModal) {
    closeCart();
  }
  if (event.target === previewModal) {
    closePreview();
  }
  // Close filter menu if clicking outside
  if (isFilterMenuOpen && filterControlsWrapper && toggleFilterMenuBtn &&
    !filterControlsWrapper.contains(event.target) &&
    !toggleFilterMenuBtn.contains(event.target)) {
    toggleFilterMenu();
  }
});
currToggle.addEventListener('click', toggleCurrency);


function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function clearCartOnCurrencyChange() {
  localStorage.removeItem('cart');
  cart = [];
  updateCartUI();
  showAlert("Cart has been cleared due to currency change. Please add items again.", "info");
  console.log("Cart cleared due to currency change.");
}

function updateCartUI() {
  cartCountSpan.textContent = cart.length;
  cartIcon.setAttribute('data-count', cart.length);

  let total = 0;
  if (cart.length === 0) {
    cartList.innerHTML = '<li class="empty-cart-message">Your cart is empty.</li>';
    cartTotal.textContent = `Total: ${formatPrice(0, currentCurrency)}`;
    clearCartBtn.disabled = true;
    checkoutBtn.disabled = true;

    if (previewImageContainer) {
      previewImageContainer.style.display = 'none';
    }
  } else {
    cartList.innerHTML = cart.map((p, i) => {
      const itemPrice = (currentCurrency === 'USD') ? p.price_usd : p.price_idr;

      total += itemPrice;
      const identifier = p.extractedId || p.filename || 'N/A';
      return `
        <li class="cart-item" data-preview-url="${p.preview_url}">
          <span class="cart-item-number">${i + 1}</span>
          <span class="cart-item-info">${p.title} - ${p.license} #${identifier}</span>
          <span class="cart-item-price">${formatPrice(itemPrice, currentCurrency)}</span>
          <button class="remove-btn" data-index="${i}">✕</button>
        </li>`;
    }).join('');
    cartTotal.textContent = `Total: ${formatPrice(total, currentCurrency)}`;
    clearCartBtn.disabled = false;
    checkoutBtn.disabled = false;

    document.querySelectorAll('.remove-btn').forEach(button => {
      button.addEventListener('click', (event) => {
        const indexToRemove = event.target.dataset.index;
        removeFromCart(indexToRemove);
      });
    });

    if (!previewImageContainer) {
      previewImageContainer = document.getElementById('global-cart-preview');
    }

    document.querySelectorAll('.cart-item').forEach(itemElement => {
      let itemHoverTimeout;

      itemElement.addEventListener('mouseenter', () => {
        clearTimeout(currentPreviewTimeout);
        clearTimeout(itemHoverTimeout);

        itemHoverTimeout = setTimeout(() => {
          const previewUrl = itemElement.dataset.previewUrl;
          if (previewUrl) {
            previewImageContainer.innerHTML = `<img src="${previewUrl}" alt="Product Preview">`;
            previewImageContainer.style.display = 'block';

            previewImageContainer.offsetWidth;
            previewImageContainer.style.opacity = '1';
          }
        }, 200);
      });

      itemElement.addEventListener('mouseleave', () => {
        clearTimeout(itemHoverTimeout);
        currentPreviewTimeout = setTimeout(() => {
          previewImageContainer.style.opacity = '0';
          setTimeout(() => {
            previewImageContainer.style.display = 'none';
          }, 300);
        }, 300);
      });
    });


    if (previewImageContainer) {
      previewImageContainer.style.display = 'none';
    }
  }
  saveCart();
}

function toggleCurrency() {
  const oldCurrency = currentCurrency;
  currentCurrency = (oldCurrency === 'USD') ? 'IDR' : 'USD';

  if (currentCurrency !== oldCurrency) {
    clearCartOnCurrencyChange();
  }

  localStorage.setItem('currentCurrency', currentCurrency);
  currToggle.textContent = `${currentCurrency === 'USD' ? 'USD / IDR' : 'IDR / USD'}`;
  renderProducts();
  updateCartUI();
}
function formatPrice(amount, currency) {
  if (amount === null || isNaN(amount)) {
    return currency === 'IDR' ? 'IDR 0' : '$0.00'; // Ensure no "NaN" or "undefined"
  }
  if (currency === 'IDR') {
    if (amount >= 1000) {
      return `IDR ${(amount / 1000).toFixed(0)}K`;
    }
    return `IDR ${amount.toFixed(0)}`;
  }
  return `$${amount.toFixed(2)}`;
}

function removeFromCart(index) {
  cart.splice(parseInt(index), 1);
  updateCartUI();
}

function clearCart() {
  if (confirm("Are you sure you want to clear your cart?")) {
    cart = [];
    updateCartUI();
  }
}

function showCart() {
  updateCartUI();
  cartModal.style.display = 'flex';
}

window.closeCart = function () {
  cartModal.style.display = 'none';
}

function handleCategoryClick(cat) {
  activeCategory = cat;
  currentPage = 1;
  updateURLParams(currentPage, activeCategory, currentTitleFilter, currentKeywordFilter, currentFilenameFilter, minPriceFilter, maxPriceFilter);
  renderProducts();
  highlightActiveCategory();
}

function renderCategories(categories) {

  const maxVisibleCategories = 9;
  let isExpanded = false;

  const allBtn = document.createElement('button');
  allBtn.textContent = 'All';
  allBtn.className = 'category-btn ' + (activeCategory === '' ? 'active' : '');
  allBtn.onclick = () => handleCategoryClick('');
  categoryTabsContainer.innerHTML = '';
  categoryTabsContainer.appendChild(allBtn);

  const visibleCategories = categories.slice(0, maxVisibleCategories);
  const hiddenCategories = categories.slice(maxVisibleCategories);

  visibleCategories.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.className = 'category-btn ' + (activeCategory === cat ? 'active' : '');
    btn.onclick = () => handleCategoryClick(cat);
    categoryTabsContainer.appendChild(btn);
  });

  if (hiddenCategories.length > 0) {
    const hiddenCategoriesContainer = document.createElement('div');
    hiddenCategoriesContainer.id = 'hiddenCategoriesContainer';
    hiddenCategoriesContainer.style.display = 'none';

    hiddenCategories.forEach(cat => {
      const btn = document.createElement('button');
      btn.textContent = cat;
      btn.className = 'category-btn ' + (activeCategory === cat ? 'active' : '');
      btn.onclick = () => handleCategoryClick(cat);
      hiddenCategoriesContainer.appendChild(btn);
    });
    categoryTabsContainer.appendChild(hiddenCategoriesContainer);

    const toggleButton = document.createElement('button');
    toggleButton.id = 'toggleCategoriesBtn';
    toggleButton.textContent = 'Expand ▼';
    toggleButton.className = 'category-toggle-btn';
    toggleButton.onclick = () => {
      isExpanded = !isExpanded;
      if (isExpanded) {
        hiddenCategoriesContainer.style.display = 'block';
        toggleButton.textContent = 'Collapse ▲';
      } else {
        hiddenCategoriesContainer.style.display = 'none';
        toggleButton.textContent = 'Expand ▼';
      }
    };
    categoryTabsContainer.appendChild(toggleButton);
  }
}
function highlightActiveCategory() {
  document.querySelectorAll('.categories .category-btn').forEach(btn => {
    btn.classList.remove('active');
    if ((btn.textContent === activeCategory) || (activeCategory === '' && btn.textContent === 'All')) {
      btn.classList.add('active');
    }
  });
}

// --- helper: parse numeric prefix dari filename ---
// contoh: "3000_hbcfhwb" -> 3000 ; "file_abc" -> null
function parseNumericPrefix(filename) {
  if (!filename) return null;
  const m = filename.match(/^(\d+)(?:[_-].*)?/);
  return m ? Number(m[1]) : null;
}

// comparator yang "numeric-aware" untuk filename
// dir = 1 untuk ascending, -1 untuk descending
function compareFilenameNumeric(fa, fb, dir = 1) {
  // normalisasi: kosong -> ''
  fa = (fa || '').toString();
  fb = (fb || '').toString();

  const na = parseNumericPrefix(fa);
  const nb = parseNumericPrefix(fb);

  if (na !== null && nb !== null) {
    if (na < nb) return -1 * dir;
    if (na > nb) return 1 * dir;
    // jika prefix sama, bandingkan sisa string setelah prefix
    const ra = fa.replace(/^\d+[_-]?/, '');
    const rb = fb.replace(/^\d+[_-]?/, '');
    return ra.localeCompare(rb) * dir;
  }

  if (na !== null && nb === null) {
    // treat numeric-prefixed names before non-numeric in ascending
    return -1 * dir;
  }

  if (na === null && nb !== null) {
    return 1 * dir;
  }

  // tidak ada prefix numeric di keduanya -> biasa compare
  return fa.localeCompare(fb) * dir;
}
// --- helper: get numeric price berdasarkan license & currency ---
function getProductPriceForSort(p) {
  if (!p) return NaN;
  let priceVal = NaN;

  if (currentCurrency === 'USD') {
    if (selectedLicense === 'commercial') {
      priceVal = parseFloat(p.price_commercial);
    } else if (selectedLicense === 'extended') {
      priceVal = parseFloat(p.price_extended);
    } else {
      priceVal = parseFloat(p.price);
    }
  } else { // IDR
    if (selectedLicense === 'commercial') {
      priceVal = parseFloat(p.idr_commercial);
    } else if (selectedLicense === 'extended') {
      priceVal = parseFloat(p.idr_extended);
    } else {
      priceVal = parseFloat(p.idr_price);
    }
  }

  return isNaN(priceVal) ? NaN : priceVal;
}

// perbaiki listener sortSelect (jangan panggil updateURLParams tanpa argumen)
if (sortSelect) {
  sortSelect.addEventListener('change', () => {
    currentPage = 1;
    // jika mau menyimpan sort di URL, extend updateURLParams untuk menerima param sort
    renderProducts();
  });
}

async function renderProducts() {
  storeDiv.innerHTML = '';
  let productsToProcess = allProducts || [];

  // 1. Filter by category first
  if (activeCategory) {
    productsToProcess = productsToProcess.filter(p => p.category === activeCategory);
  }

  let finalFilteredProducts = productsToProcess.slice(); // clone
  if (currentTitleFilter) {
    const q = currentTitleFilter.toLowerCase();
    finalFilteredProducts = finalFilteredProducts.filter(p => {
      const productTitle = p.title ? p.title.toLowerCase() : '';
      return productTitle.includes(q);
    });
  }

  if (currentKeywordFilter) {
    const q = currentKeywordFilter.toLowerCase();
    finalFilteredProducts = finalFilteredProducts.filter(p => {
      const productKeywords = p.keyword ? p.keyword.toString().toLowerCase() : '';
      return productKeywords.includes(q);
    });
  }

  if (currentFilenameFilter) {
    const q = currentFilenameFilter.toLowerCase();
    finalFilteredProducts = finalFilteredProducts.filter(p => {
      const productFilename = p.filename ? p.filename.toLowerCase() : '';
      return productFilename.includes(q);
    });
  }

  if (minPriceFilter !== null || maxPriceFilter !== null) {
    finalFilteredProducts = finalFilteredProducts.filter(p => {
      const priceToCheck = getProductPriceForSort(p);
      if (isNaN(priceToCheck)) return false;
      const matchesMin = (minPriceFilter === null || priceToCheck >= minPriceFilter);
      const matchesMax = (maxPriceFilter === null || priceToCheck <= maxPriceFilter);
      return matchesMin && matchesMax;
    });
  }

  // ✅ Apply user-only filters (likes / wishlist)
  if (filterLikedOnly || filterWishlistOnly) {
    const user = await getCurrentUser();
    if (user) {
      try {
        const { data, error } = await supabase
          .from('CustomerData')
          .select('data_content')
          .eq('user_id', user.id)
          .single();

        if (!error && data && data.data_content) {
          const likes = Array.isArray(data.data_content.likes) ? data.data_content.likes : [];
          const wishlist = Array.isArray(data.data_content.wishlist) ? data.data_content.wishlist : [];

          finalFilteredProducts = finalFilteredProducts.filter(p => {
            const inLiked = likes.includes(p.filename);
            const inWishlist = wishlist.includes(p.filename);
            if (filterLikedOnly && filterWishlistOnly) return inLiked || inWishlist;
            if (filterLikedOnly) return inLiked;
            if (filterWishlistOnly) return inWishlist;
            return true;
          });
        }
      } catch (err) {
        console.error('Error applying user-only filters', err);
      }
    } else {
      finalFilteredProducts = [];
      searchResultCount.innerHTML = `<p class="no-products-message">⚠️ You must be logged in to use user-only filters (Liked / Wishlist).</p>`;
      searchResultCount.style.display = 'block';
      storeDiv.innerHTML = '';
      paginationControls.innerHTML = '';
      return;
    }
  }


  const sortVal = sortSelect ? sortSelect.value : 'popular';
  if (sortVal === 'popular') {
    finalFilteredProducts.sort((a, b) => {
      const fa = (a && a.filename) ? a.filename : '';
      const fb = (b && b.filename) ? b.filename : '';
      const ra = (ratingsMap[fa] !== undefined) ? ratingsMap[fa] : RATING_DEFAULT;
      const rb = (ratingsMap[fb] !== undefined) ? ratingsMap[fb] : RATING_DEFAULT;
      return rb - ra;
    });
  } else if (sortVal === 'name_asc') {
    finalFilteredProducts.sort((a, b) => compareFilenameNumeric(a.filename, b.filename, 1));
  } else if (sortVal === 'name_desc') {
    finalFilteredProducts.sort((a, b) => compareFilenameNumeric(a.filename, b.filename, -1));
  } else if (sortVal === 'price_asc') {
    finalFilteredProducts.sort((a, b) => {
      const pa = getProductPriceForSort(a);
      const pb = getProductPriceForSort(b);
      const va = isNaN(pa) ? Infinity : pa; // produk tanpa price akan di akhir pada ascending
      const vb = isNaN(pb) ? Infinity : pb;
      return va - vb;
    });
  } else if (sortVal === 'price_desc') {
    finalFilteredProducts.sort((a, b) => {
      const pa = getProductPriceForSort(a);
      const pb = getProductPriceForSort(b);
      const va = isNaN(pa) ? -Infinity : pa;
      const vb = isNaN(pb) ? -Infinity : pb;
      return vb - va;
    });
  }

  // --- pagination ---
  const totalPages = Math.ceil(finalFilteredProducts.length / itemsPerPage) || 1;

  if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  } else if (totalPages === 0) {
    currentPage = 1;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const productsToDisplay = finalFilteredProducts.slice(startIndex, endIndex);

  // tampilkan pesan jika kosong
  if (productsToDisplay.length === 0) {
    let message = 'No products found matching your criteria.';
    if (currentTitleFilter || currentKeywordFilter || currentFilenameFilter || minPriceFilter !== null || maxPriceFilter !== null || activeCategory) {
      message += `<br>Please adjust your filters.`;
    }
    searchResultCount.innerHTML = `<p class="no-products-message">${message}</p>`;
    searchResultCount.style.display = 'block';
    storeDiv.innerHTML = '';
    paginationControls.innerHTML = '';
    return;
  }

  // Render produk
  storeDiv.innerHTML = '';
  productsToDisplay.forEach(p => {
    let price;
    if (currentCurrency === 'USD') {
      price = selectedLicense === 'commercial' ? p.price_commercial : selectedLicense === 'extended' ? p.price_extended : p.price;
    } else { // currentCurrency === 'IDR'
      price = selectedLicense === 'commercial' ? p.idr_commercial : selectedLicense === 'extended' ? p.idr_extended : p.idr_price;
    }
    const formattedPrice = formatPrice(price, currentCurrency);

    const productUrl = `products/${p.filename}.html`;
    const html = `
      <div class="product-card">
        <div class="image-wrapper">
          <a href="${productUrl}" class="product-link">
            <img src="${p.preview_url}" alt="${p.title}"/>
            <div class="preview-overlay">
                <i class="fas fa-eye"></i> <span>View Product</span>
            </div>
          </a>
        </div>
        <h2>${p.title || ''}</h2>
        <id>ID #${p.filename || ''}</id>
        <div class="product-meta">
          <div class="format-div">
            <button class="btn" style="height: 20px; padding: 0 10px; font-size: 0.7rem; margin-top: 3px;"
                        onclick="handleCategoryClick('${p.category}')">
                        ${p.category}
            </button>
          <div class="product-actions">
            <button class="like-btn" data-filename="${p.filename}" title="Like">
              <i class="fas fa-heart"></i>
            </button>
            <button class="wishlist-btn" data-filename="${p.filename}" title="Wishlist">
              <i class="fas fa-bookmark"></i>
            </button>
          </div>
          </div>

          <div class="product-price">
            <span class="price">${formattedPrice}</span>
            <span class="license-type">${selectedLicense.charAt(0).toUpperCase() + selectedLicense.slice(1)} License</span>
          </div>
        </div>
        <button class="btn add-to-cart-btn" data-filename="${p.filename}" onclick='addToCart({...${JSON.stringify(p).replace(/'/g, "\\'")}, price:${price}, selectedCurrency: "${currentCurrency}", license: "${selectedLicense}"})'>+ Add to Cart</button>
      </div>
    `;
    storeDiv.innerHTML += html;
  });

  // update pesan hasil pencarian
  const countMessageParts = [];
  if (currentTitleFilter) countMessageParts.push(`title "<span class="keyword">${currentTitleFilter}</span>"`);
  if (currentKeywordFilter) countMessageParts.push(`keyword "<span class="keyword">${currentKeywordFilter}</span>"`);
  if (currentFilenameFilter) countMessageParts.push(`filename "<span class="keyword">${currentFilenameFilter}</span>"`);
  if (minPriceFilter !== null || maxPriceFilter !== null) {
    let priceRange = [];
    if (minPriceFilter !== null) priceRange.push(`>= ${formatPrice(minPriceFilter, currentCurrency)}`);
    if (maxPriceFilter !== null) priceRange.push(`<= ${formatPrice(maxPriceFilter, currentCurrency)}`);
    countMessageParts.push(`price ${priceRange.join(' and ')}`);
  }
  if (activeCategory) countMessageParts.push(`category "<span class="category">${activeCategory}</span>"`);

  let message = `Found <b>${finalFilteredProducts.length}</b> product`;
  if (finalFilteredProducts.length !== 1) message += 's';
  if (countMessageParts.length > 0) {
    message += ` matching ${countMessageParts.join(' and ')}`;
  }

  searchResultCount.innerHTML = message;
  searchResultCount.style.display = 'block';
  markUserActions();
  renderPaginationControls(totalPages);
}

function renderPaginationControls(totalPages) {
  paginationControls.innerHTML = '';

  if (totalPages <= 1) {
    paginationControls.style.display = 'none';
    return;
  }
  else {
    paginationControls.style.display = 'flex';
  }
  totalPagesDisplay.textContent = `${totalPages} pages`;
  paginationControls.appendChild(totalPagesDisplay);

  const prevButton = document.createElement('button');
  prevButton.textContent = 'Previous';
  prevButton.classList.add('pagination-btn');
  prevButton.disabled = (currentPage === 1);
  prevButton.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      updateURLParams(currentPage, activeCategory, currentTitleFilter, currentKeywordFilter, currentFilenameFilter, minPriceFilter, maxPriceFilter);
      renderProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  paginationControls.appendChild(prevButton);

  const paginationNumbersDiv = document.createElement('div');
  paginationNumbersDiv.classList.add('pagination-numbers');
  paginationControls.appendChild(paginationNumbersDiv);

  const maxPageButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.classList.add('pagination-btn');
    if (i === currentPage) {
      pageButton.classList.add('active');
    }
    pageButton.onclick = () => {
      currentPage = i;
      updateURLParams(currentPage, activeCategory, currentTitleFilter, currentKeywordFilter, currentFilenameFilter, minPriceFilter, maxPriceFilter);
      renderProducts();
      window.scrollTo(0, 0);
      trackUmamiEvent('Pagination', { page: currentPage });
    };

    paginationControls.appendChild(pageButton);
  }

  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next';
  nextButton.classList.add('pagination-btn');
  nextButton.disabled = (currentPage === totalPages);
  nextButton.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      updateURLParams(currentPage, activeCategory, currentTitleFilter, currentKeywordFilter, currentFilenameFilter, minPriceFilter, maxPriceFilter);
      renderProducts();
      window.scrollTo(0, 0);
    }
  };
  paginationControls.appendChild(nextButton);

  if (!document.getElementById('pageInputContainer')) {
    const pageInputContainer = document.createElement('div');
    pageInputContainer.id = 'pageInputContainer';
    pageInputContainer.style.display = 'flex';
    pageInputContainer.style.alignItems = 'center';
    pageInputContainer.style.marginLeft = '20px';

    pageInput = document.createElement('input');
    pageInput.type = 'number';
    pageInput.id = 'pageInput';
    pageInput.min = '1';
    pageInput.max = totalPages.toString();
    pageInput.value = currentPage.toString();
    pageInput.style.width = '70px';
    pageInput.style.padding = '8px 15px';
    pageInput.style.border = '1px solid #ccc';
    pageInput.style.borderRadius = '5px';
    pageInput.style.textAlign = 'center';
    pageInput.style.fontSize = '1rem';

    goToPageButton = document.createElement('button');
    goToPageButton.textContent = 'Go';
    goToPageButton.classList.add('pagination-btn');
    goToPageButton.style.marginLeft = '5px';

    pageInputContainer.appendChild(pageInput);
    pageInputContainer.appendChild(goToPageButton);
    paginationControls.appendChild(pageInputContainer);

    goToPageButton.addEventListener('click', () => {
      const pageNum = parseInt(pageInput.value, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        currentPage = pageNum;
        updateURLParams(currentPage, activeCategory, currentTitleFilter, currentKeywordFilter, currentFilenameFilter, minPriceFilter, maxPriceFilter);
        renderProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        showAlert(`Please enter a valid page number between 1 and ${totalPages}.`, "error");
        pageInput.value = currentPage.toString();
      }
    });

    pageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        goToPageButton.click();
      }
    });
  } else {

    pageInput = document.getElementById('pageInput');
    goToPageButton = document.getElementById('goToPageButton');
    pageInput.max = totalPages.toString();
    pageInput.value = currentPage.toString();
  }
}

window.setLicense = function (val) {
  selectedLicense = val;
  currentPage = 1;
  renderProducts();
}


function extractIdFromUrl(url) {
  if (!url) return '';
  const urlParts = url.split('/');
  let filename = urlParts[urlParts.length - 1];

  const dotIndex = filename.indexOf('.');
  if (dotIndex !== -1) {
    filename = filename.substring(0, dotIndex);
  }
  if (filename.startsWith('preview_') && filename.length > 'preview_'.length) {
    return filename.substring('preview_'.length);
  }
  return '';
}

window.addToCart = function (product) {
  const extractedId = product.filename || extractIdFromUrl(product.preview_url);

  let originalPriceUSD, originalPriceIDR;
  if (product.license === 'personal') {
    originalPriceUSD = product.price;
    originalPriceIDR = product.idr_price;
  } else if (product.license === 'commercial') {
    originalPriceUSD = product.price_commercial;
    originalPriceIDR = product.idr_commercial;
  } else if (product.license === 'extended') {
    originalPriceUSD = product.price_extended;
    originalPriceIDR = product.idr_extended;
  }
  const productWithCartDetails = {
    ...product,
    extractedId: extractedId,
    license: product.license,
    price_usd: originalPriceUSD,
    price_idr: originalPriceIDR,
    selectedCurrencyAtAddToCart: currentCurrency,
    price: (currentCurrency === 'USD' ? originalPriceUSD : originalPriceIDR),
    preview_url: product.preview_url
  };

  const existingProductIndex = cart.findIndex(item =>
    item.id === productWithCartDetails.id &&
    item.license === productWithCartDetails.license &&
    item.filename === productWithCartDetails.filename
  );

  if (existingProductIndex > -1) {
    showAlert(`"${productWithCartDetails.title}" with "${productWithCartDetails.license}" license is already in your cart.`, "info");
  } else {
    cart.push(productWithCartDetails);
    updateCartUI();
    showAlert("Added to cart.", "success");

    incrementRating(productWithCartDetails.filename);

  }

}

async function incrementRating(filename) {
  try {
    const { error } = await supabase.rpc('increment_rating', { p_filename: filename });
    if (error) {
      console.error("Failed to increment rating:", error.message);
    } else {
      console.log("Rating updated for", filename);
      await loadRatings();
    }

  } catch (err) {
    console.error("Unexpected error incrementing rating:", err);
  }
}

async function loadProducts() {
  const loadingIndicator = document.getElementById('loadingIndicator');
  const errorMessage = document.getElementById('errorMessage');

  try {
    // tampilkan loading, sembunyikan error
    if (loadingIndicator) loadingIndicator.style.display = 'block';
    if (errorMessage) {
      errorMessage.style.display = 'none';
      errorMessage.textContent = '';
    }
    storeDiv.innerHTML = '';

    const res = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=*,keyword,rating:productrating(rating)`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();
    allProducts = data;
    /* allProducts = data.map(p => {
      return {
        ...p,
        rating: (p.rating && p.rating.length > 0) ? p.rating[0].rating : 1
      };
    }); */

    await loadRatings();

    const categories = [...new Set(data.map(p => p.category).filter(Boolean))];
    renderCategories(categories);
    renderProducts();
    updateCartUI();
  } catch (err) {
    console.error('Fetch error:', err);
    if (errorMessage) {
      errorMessage.textContent = `❌ Failed to load products: ${err.message}`;
      errorMessage.style.display = 'block';
    }
    storeDiv.innerHTML = '';
    storeDiv.innerHTML = `<button class="btn fas fa-arrows-rotate" onclick="localStorage.clear()">Refresh</button>`;
  } finally {
    // selalu sembunyikan loading
    if (loadingIndicator) loadingIndicator.style.display = 'none';
  }
}
// --- Rating map (filename => rating) ---
let ratingsMap = {};
const RATING_DEFAULT = 1;

// Load all ratings dari tabel productrating (lowercase)
async function loadRatings() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/productrating?select=filename,rating`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const arr = await res.json();
    ratingsMap = {};
    for (const r of arr) {
      if (r && r.filename) {
        // pastikan rating numeric
        ratingsMap[r.filename] = Number(r.rating) || RATING_DEFAULT;
      }
    }
    console.log('ratingsMap loaded', ratingsMap);
  } catch (err) {
    console.error('Failed to load ratings:', err);
    ratingsMap = {}; // fallback
  }
}

async function applyAllFilters() {
  currentTitleFilter = (titleFilterInput && titleFilterInput.value) ? titleFilterInput.value.toLowerCase() : '';
  currentKeywordFilter = (keywordFilterInput && keywordFilterInput.value) ? keywordFilterInput.value.toLowerCase() : '';
  currentFilenameFilter = (filenameFilterInput && filenameFilterInput.value) ? filenameFilterInput.value.toLowerCase() : '';
  minPriceFilter = (minPriceInput && minPriceInput.value !== '') ? parseFloat(minPriceInput.value) : null;
  maxPriceFilter = (maxPriceInput && maxPriceInput.value !== '') ? parseFloat(maxPriceInput.value) : null;

  filterLikedOnly = likedFilterInput && likedFilterInput.checked;
  filterWishlistOnly = wishlistFilterInput && wishlistFilterInput.checked;

  currentPage = 1;

  updateURLParams(currentPage, activeCategory, currentTitleFilter, currentKeywordFilter, currentFilenameFilter, minPriceFilter, maxPriceFilter);
  renderProducts();

  trackUmamiEvent('Apply Filters', {
    category: activeCategory || 'all',
    title: currentTitleFilter,
    keyword: currentKeywordFilter,
    filename: currentFilenameFilter,
    minPrice: minPriceFilter,
    maxPrice: maxPriceFilter
  });

  toggleFilterMenu();
}

function clearAllFilters() {
  currentTitleFilter = '';
  currentKeywordFilter = '';
  currentFilenameFilter = '';
  minPriceFilter = null;
  maxPriceFilter = null;

  window.filterLiked = false;
  window.filterWishlist = false;
  window.userLikedList = [];
  window.userWishlist = [];

  currentPage = 1;

  if (titleFilterInput) titleFilterInput.value = '';
  if (keywordFilterInput) keywordFilterInput.value = '';
  if (filenameFilterInput) filenameFilterInput.value = '';
  if (minPriceInput) minPriceInput.value = '';
  if (maxPriceInput) maxPriceInput.value = '';
  filterLikedOnly = false;
  filterWishlistOnly = false;
  if (likedFilterInput) likedFilterInput.checked = false;
  if (wishlistFilterInput) wishlistFilterInput.checked = false;

  updateURLParams(currentPage, activeCategory, currentTitleFilter, currentKeywordFilter, currentFilenameFilter, minPriceFilter, maxPriceFilter);
  renderProducts();
  toggleFilterMenu();
}


// Function to toggle the filter menu visibility
function toggleFilterMenu() {
  isFilterMenuOpen = !isFilterMenuOpen;
  if (filterControlsWrapper) {
    filterControlsWrapper.style.display = isFilterMenuOpen ? 'flex' : 'none'; // Use 'flex' for the internal layout
  }
}


document.addEventListener('DOMContentLoaded', () => {
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    console.log("Supabase client initialized in product.js.");

    // Initialize filter state from URL
    const { page, category, titleFilter, keywordFilter, filenameFilter, minPrice, maxPrice } = getQueryParams();
    currentPage = page;
    activeCategory = category;
    currentTitleFilter = titleFilter;
    currentKeywordFilter = keywordFilter;
    currentFilenameFilter = filenameFilter;
    minPriceFilter = minPrice;
    maxPriceFilter = maxPrice;

    // Set initial UI values for new filters
    if (titleFilterInput) titleFilterInput.value = currentTitleFilter;
    if (keywordFilterInput) keywordFilterInput.value = currentKeywordFilter;
    if (filenameFilterInput) filenameFilterInput.value = currentFilenameFilter;
    // Ensure price inputs are set to empty string if null
    if (minPriceInput) minPriceInput.value = minPriceFilter !== null ? minPriceFilter.toString() : '';
    if (maxPriceInput) maxPriceInput.value = maxPriceFilter !== null ? maxPriceFilter.toString() : '';

    loadProducts(); // Load products with initial filters
    updateCartUI();
    currToggle.textContent = `${currentCurrency === 'USD' ? 'USD / IDR' : 'IDR / USD'}`;

    // Event listeners for filter controls
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', applyAllFilters);
    }
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', clearAllFilters);
    }

    // Event listeners for the dropdown toggle buttons
    if (toggleFilterMenuBtn) {
      toggleFilterMenuBtn.addEventListener('click', toggleFilterMenu);
    }
    if (closeFilterMenuBtn) {
      closeFilterMenuBtn.addEventListener('click', toggleFilterMenu);
    }


  } else {
    console.error("Error: Supabase SDK not available. Cannot initialize product.js.");
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".slide");
  const prevBtn = document.querySelector(".nav.prev");
  const nextBtn = document.querySelector(".nav.next");
  let currentIndex = 0;
  let autoPlayInterval;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.remove("active");
      if (i === index) slide.classList.add("active");
    });
    currentIndex = index;
  }

  function nextSlide() {
    const newIndex = (currentIndex + 1) % slides.length;
    showSlide(newIndex);
  }

  function prevSlide() {
    const newIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(newIndex);
  }

  // Event Listeners
  nextBtn.addEventListener("click", () => {
    nextSlide();
    resetAutoPlay();
  });
  prevBtn.addEventListener("click", () => {
    prevSlide();
    resetAutoPlay();
  });

  // Auto play every 5s
  function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 5000);
  }
  function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay();
  }

  startAutoPlay();
});
function handleScroll() {
  const subHeader = document.getElementById('subHeader');
  const isMobile = window.innerWidth <= 768; // cek ukuran layar

  if (isMobile) {
    // paksa hapus scrolled di mobile
    subHeader.classList.remove('scrolled');
    return; // hentikan, tidak perlu lanjut
  }

  // hanya jalan kalau bukan mobile
  if (window.scrollY > 50) {
    subHeader.classList.add('scrolled');
  } else {
    subHeader.classList.remove('scrolled');
  }
}
// helper: redirect to auth with alert
function requireAuthRedirect(actionText = '') {
  showAlert(`You must log in to ${actionText}. Redirecting to sign in...`, 'error');
  setTimeout(() => { window.location.href = 'auth.html'; }, 1200);
}

// Helper: get current user (returns user object or null)
async function getCurrentUser() {
  try {
    const { data } = await supabase.auth.getUser();
    return data && data.user ? data.user : null;
  } catch (e) {
    console.error('getCurrentUser error', e);
    return null;
  }
}

// Toggle field (likes/wishlist) for current user; will call RPC toggle_user_data_content
// buttonEl is optional (if provided, we toggle its class based on result)
async function toggleUserField(filename, field, buttonEl) {
  if (!filename) return;

  const user = await getCurrentUser();
  if (!user) {
    requireAuthRedirect(field === 'likes' ? 'like this product' : 'add to wishlist');
    return;
  }

  try {
    const { data, error } = await supabase.rpc('toggle_user_data_content', {
      p_user_id: user.id,
      p_field: field,
      p_product: filename
    });

    if (error) {
      console.error('RPC toggle_user_data_content error', error);
      showAlert('Failed to update. Try again later.', 'error');
      return;
    }

    // Normalize returned data (Supabase may return json directly or wrapped)
    let returned = data;
    if (Array.isArray(returned) && returned.length) returned = returned[0];
    if (returned && returned.hasOwnProperty('toggle_user_data_content')) returned = returned.toggle_user_data_content;

    // returned should be the jsonb object of data_content, e.g. { likes: [...], wishlist: [...] }
    const content = returned || {};

    // Determine active state
    const arr = Array.isArray(content[field]) ? content[field] : (content[field] ? [content[field]] : []);
    const isActive = arr.includes(filename);

    // Update all buttons for this filename on page (in case multiple cards exist)
    if (field === 'likes') {
      document.querySelectorAll(`.like-btn[data-filename="${CSS.escape(filename)}"]`).forEach(b => {
        b.classList.toggle('liked', isActive);
      });
    } else if (field === 'wishlist') {
      document.querySelectorAll(`.wishlist-btn[data-filename="${CSS.escape(filename)}"]`).forEach(b => {
        b.classList.toggle('wishlisted', isActive);
      });
    }

    showAlert(isActive ? `Added to ${field}.` : `Removed from ${field}.`, 'success');

    // ✅ hanya increment kalau aktif
    if (isActive) {
      incrementRating(filename);
    }

    trackUmamiEvent('User Action', {
      action: field,
      product: filename,
      status: isActive ? 'added' : 'removed'
    });

    // If profile page open, refresh profile lists
    if (window.location.pathname.endsWith('profile.html')) {
      if (typeof loadProfileData === 'function') {
        loadProfileData();
      }
    }

  } catch (err) {
    console.error('toggleUserField error', err);
    showAlert('Unexpected error. Try again later.', 'error');
  }
}

// markUserActions: baca CustomerData untuk user dan terapkan kelas visual pada tombol
async function markUserActions() {
  const user = await getCurrentUser();
  if (!user) {
    // remove any active state if user logged out
    document.querySelectorAll('.like-btn.liked').forEach(b => b.classList.remove('liked'));
    document.querySelectorAll('.wishlist-btn.wishlisted').forEach(b => b.classList.remove('wishlisted'));
    return;
  }

  try {
    const { data, error } = await supabase
      .from('CustomerData')
      .select('data_content')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      // nothing to mark
      return;
    }

    const content = data.data_content || {};
    const likes = Array.isArray(content.likes) ? content.likes : [];
    const wishlist = Array.isArray(content.wishlist) ? content.wishlist : [];

    // apply classes
    document.querySelectorAll('.like-btn').forEach(btn => {
      const fname = btn.dataset.filename;
      btn.classList.toggle('liked', likes.includes(fname));
    });
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
      const fname = btn.dataset.filename;
      btn.classList.toggle('wishlisted', wishlist.includes(fname));
    });

  } catch (err) {
    console.error('markUserActions error', err);
  }
}

// Event delegation for like/wishlist buttons (safe, minimal changes)
document.addEventListener('click', (e) => {
  const likeBtn = e.target.closest('.like-btn');
  if (likeBtn) {
    const filename = likeBtn.dataset.filename;
    toggleUserField(filename, 'likes', likeBtn);
    return;
  }
  const wishBtn = e.target.closest('.wishlist-btn');
  if (wishBtn) {
    const filename = wishBtn.dataset.filename;
    toggleUserField(filename, 'wishlist', wishBtn);
    return;
  }
});

window.addEventListener('scroll', handleScroll);
window.addEventListener('resize', handleScroll);
document.addEventListener('DOMContentLoaded', handleScroll); // cek awal
document.getElementById('currentYear').textContent = new Date().getFullYear();