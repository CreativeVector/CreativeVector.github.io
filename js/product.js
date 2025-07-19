const supabaseUrl = 'https://lekxtacqnusomlvtfxcz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxla3h0YWNxbnVzb21sdnRmeGN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDU0OTIsImV4cCI6MjA2NTU4MTQ5Mn0.mUGy47EGjDxWKWFl4EPWgYfYnzKB9YaTTYgmRihRQXU';
const tableName = 'StorePreview';
let supabase;

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    query: params.get('q') || '',
    page: parseInt(params.get('page')) || 1,
    category: params.get('category') || ''
  };
}

function updateURLParams(query, page, category) {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (page > 1) params.set('page', page);
  if (category) params.set('category', category);

  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', newUrl);
}

let allProducts = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let activeCategory = '';
let selectedLicense = 'personal';
let searchQuery = '';
let currentPage = 1;
const itemsPerPage = 12;


let previewImageContainer; 

let currentPreviewTimeout;


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
const searchInput = document.getElementById('searchInput');
const paginationControls = document.getElementById('pagination-controls');


cartIcon.addEventListener("click", showCart);
clearCartBtn.addEventListener("click", clearCart);
checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    showAlert("Your cart is empty. Please add some items before checking out.", "info");
    return;
  }
  
  location.href='/checkout.html';
});
window.addEventListener('click', (event) => {
    if (event.target === cartModal) {
        closeCart();
    }
    if (event.target === previewModal) {
        closePreview();
    }
});

let debounceTimeout;
searchInput.addEventListener('input', (e) => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    searchQuery = e.target.value.toLowerCase();
    currentPage = 1;
    updateURLParams(searchQuery, currentPage);
    renderProducts();
  }, 300);
});

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
  cartCountSpan.textContent = cart.length;
  cartIcon.setAttribute('data-count', cart.length);

  let total = 0;
  if (cart.length === 0) {
    cartList.innerHTML = '<li class="empty-cart-message">Your cart is empty.</li>';
    cartTotal.textContent = 'Total: $0.00';
    clearCartBtn.disabled = true;
    checkoutBtn.disabled = true;
    
    if (previewImageContainer) {
        previewImageContainer.style.display = 'none';
    }
  } else {
    cartList.innerHTML = cart.map((p, i) => {
      total += p.price;
      const identifier = p.extractedId || p.filename || 'N/A'; 
      return `
        <li class="cart-item" data-preview-url="${p.preview_url}"> 
          <span class="cart-item-number">${i + 1}</span> 
          <span class="cart-item-info">${p.title} - ${p.license} #${identifier}</span>
          <span class="cart-item-price">$${parseFloat(p.price).toFixed(2)}</span>
          <button class="remove-btn" data-index="${i}">✕</button>
        </li>`;
    }).join('');
    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
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

window.closeCart = function() {
  cartModal.style.display = 'none';
}


window.showPreview = function(url, title, desc, filename, price1, price2, price3) {
  previewImage.src = url;
  previewTitle.textContent = title;
  previewDesc.textContent = desc;
  previewFilename.textContent = "ID #"+ filename; 

  previewPrice1.innerHTML = `
    <div class="textDesc">
      <a href="https://gist.githubusercontent.com/AlextianCreative/0f5c41f8fa7fa759f9ea97718040b71c/raw/f03644916cba98eec073f4edfaf9e05cea54c3e0/personal.txt" target="_blank" class="btn" style="text-decoration: none;font-weight: bold;">Personal License</a>
      <h1>$${parseFloat(price1).toFixed(2)}</h1>
    </div>
  `;
  previewPrice2.innerHTML = `
    <div class="textDesc">
      <a href="https://gist.githubusercontent.com/AlextianCreative/0f5c41f8fa7fa759f9ea97718040b71c/raw/f03644916cba98eec073f4edfaf9e05cea54c3e0/commercial.txt" target="_blank" class="btn" style="text-decoration: none;font-weight: bold;">Commercial License</a>
      <h1>$${parseFloat(price2).toFixed(2)}</h1>
    </div>
  `;
  previewPrice3.innerHTML = `
    <div class="textDesc">
      <a href="https://gist.githubusercontent.com/AlextianCreative/0f5c41f8fa7fa759f9ea97718040b71c/raw/f03644916cba98eec073f4edfaf9e05cea54c3e0/extended.txt" target="_blank" class="btn" style="text-decoration: none;font-weight: bold;">Extended License</a>
      <h1>$${parseFloat(price3).toFixed(2)}</h1>
    </div>
  `;

  previewIcon1.innerHTML = `
    <img src="img/eps.png" class="icon" alt="EPS">
    <img src="img/jpg.png" class="icon" alt="JPG">
  `;

  previewModal.style.display = 'flex';
}

window.closePreview = function() {
  previewModal.style.display = 'none';
}

function goToLicense1() {
const url = `https://gist.githubusercontent.com/AlextianCreative/0f5c41f8fa7fa759f9ea97718040b71c/raw/f03644916cba98eec073f4edfaf9e05cea54c3e0/personal.txt`;
    window.open(url, '_blank');
}
function goToLicense2() {
const url = `https://gist.githubusercontent.com/AlextianCreative/0f5c41f8fa7fa759f9ea97718040b71c/raw/f03644916cba98eec073f4edfaf9e05cea54c3e0/commercial.txt`;
    window.open(url, '_blank');
}
function goToLicense3() {
const url = `https://gist.githubusercontent.com/AlextianCreative/0f5c41f8fa7fa759f9ea97718040b71c/raw/f03644916cba98eec073f4edfaf9e05cea54c3e0/extended.txt`;
    window.open(url, '_blank');
}

function handleCategoryClick(cat) {
  activeCategory = cat;
  currentPage = 1;
  updateURLParams(searchQuery, currentPage, activeCategory);
  renderProducts();
  highlightActiveCategory();
}

function renderCategories(categories) {

    const maxVisibleCategories = 9; // Batasi jumlah kategori yang terlihat
    let isExpanded = false; // Status untuk melacak apakah kategori diperluas

    const allBtn = document.createElement('button');
    allBtn.textContent = 'All';
    allBtn.className = 'category-btn ' + (activeCategory === '' ? 'active' : '');
    allBtn.onclick = () => handleCategoryClick('');
    categoryTabsContainer.appendChild(allBtn);

    const visibleCategories = categories.slice(0, maxVisibleCategories);
    const hiddenCategories = categories.slice(maxVisibleCategories);

    // Render kategori yang terlihat
    visibleCategories.forEach(cat => {
        const btn = document.createElement('button');
        btn.textContent = cat;
        btn.className = 'category-btn ' + (activeCategory === cat ? 'active' : '');
        btn.onclick = () => handleCategoryClick(cat);
        categoryTabsContainer.appendChild(btn);
    });

    // Jika ada kategori yang tersembunyi, buat wadah untuk mereka dan tombol expand/collapse
    if (hiddenCategories.length > 0) {
        const hiddenCategoriesContainer = document.createElement('div');
        hiddenCategoriesContainer.id = 'hiddenCategoriesContainer';
        hiddenCategoriesContainer.style.display = 'none'; // Sembunyikan secara default
        
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
        toggleButton.className = 'category-toggle-btn'; // Tambahkan kelas untuk styling
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

function renderProducts() {
  storeDiv.innerHTML = '';
  let filteredProducts = allProducts;

  if (activeCategory) {
    filteredProducts = filteredProducts.filter(p => p.category === activeCategory);
  }
  if (searchQuery) {
       filteredProducts = allProducts.filter(p => {
      const productCategory = p.category ? p.category.toLowerCase() : ''; 
      const productTitle = p.keyword ? p.keyword.toLowerCase() : ''; 

      const matchesCategory = activeCategory === '' || productCategory === activeCategory.toLowerCase();
      const matchesSearch = productTitle.includes(searchQuery);

      return matchesCategory && matchesSearch;
  });   
  }
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  if (currentPage > totalPages && totalPages > 0) {
      currentPage = totalPages;
  } else if (totalPages === 0) {
      currentPage = 1;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const productsToDisplay = filteredProducts.slice(startIndex, endIndex);

  if (productsToDisplay.length === 0) {
    searchResultCount.textContent = `Found ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`;
    storeDiv.innerHTML = '<p class="no-products-message">No products found matching your criteria.</p>';
    paginationControls.innerHTML = '';
    return;
  }

  productsToDisplay.forEach(p => {
    const price = selectedLicense === 'commercial' ? p.price_commercial : selectedLicense === 'extended' ? p.price_extended : p.price;
    const productUrl = `products/${p.filename}.html`;
    const html = `
    
      <div class="product-card">
        <div class="image-wrapper">
          <a href="${productUrl}" class="product-link">
            <img src="${p.preview_url}" alt="${p.title}"/>
           </a>
        </div>
        <h2>${p.title}</h2>
        <p>${p.description}</p>
        <id>ID #${p.filename}</id>
        <div class="product-meta">
          <div class="format-icons">
            <img src="img/eps.png" class="icon" alt="EPS">
            <img src="img/jpg.png" class="icon" alt="JPG">
          </div>
          <div class="product-price">
            <span class="price">$${parseFloat(price).toFixed(2)}</span>
            <span class="license-type">${selectedLicense.charAt(0).toUpperCase() + selectedLicense.slice(1)} License</span>
          </div>
        </div>
        <button class="btn add-to-cart-btn" onclick='addToCart({...${JSON.stringify(p).replace(/'/g, "\\'")}, price:${price}, license: "${selectedLicense}"})'>+ Add to Cart</button>
      </div>
   
    `;
    storeDiv.innerHTML += html;
  });

const resultDiv = document.getElementById('searchResultCount');
const isFiltered = activeCategory || searchQuery;
const countMessageParts = [];

if (searchQuery) countMessageParts.push(`<span class="keyword">${searchQuery}</span>`);
if (activeCategory) countMessageParts.push(`<span class="category">${activeCategory}</span>`);
resultDiv.style.display = 'block';
let message = `Found <b>${filteredProducts.length}</b> product${filteredProducts.length !== 1 ? 's' : ''}`;
if (countMessageParts.length > 0) {
  message += ` by <b>${countMessageParts.join(' in ')}</b>`;
}

resultDiv.innerHTML = message;
renderPaginationControls(totalPages);
}

function renderPaginationControls(totalPages) {
    paginationControls.innerHTML = '';

    if (totalPages <= 1) {
        return;
    }

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.classList.add('pagination-btn');
    prevButton.disabled = (currentPage === 1);
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            updateURLParams(searchQuery, currentPage, activeCategory);
            renderProducts();
            window.scrollTo(0, 0);
        }
    };
    paginationControls.appendChild(prevButton);

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
            updateURLParams(searchQuery, currentPage, activeCategory);
            renderProducts();
            window.scrollTo(0, 0);
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
            updateURLParams(searchQuery, currentPage, activeCategory);
            renderProducts();
            window.scrollTo(0, 0);
        }
    };
    paginationControls.appendChild(nextButton);
}

window.setLicense = function(val) {
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

window.addToCart = function(product) {
  
  
  const extractedId = product.filename || extractIdFromUrl(product.preview_url); 
  
  
  const productWithCartDetails = { 
      ...product, 
      extractedId: extractedId, 
      license: product.license, 
      price: product.price, 
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
  }
}

async function loadProducts() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=*,keyword`, {

      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    allProducts = data;
    const categories = [...new Set(data.map(p => p.category).filter(Boolean))];
    renderCategories(categories);
    renderProducts();
    updateCartUI(); 
  } catch (err) {
    storeDiv.innerHTML = `<p style="color:red;">❌ Failed to load products: ${err.message}</p>`;
    console.error('Fetch error:', err);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    const { query, page, category } = getQueryParams();
    searchQuery = query.toLowerCase();
    currentPage = page;
    activeCategory = category;
    searchInput.value = query;
    loadProducts(); 
    updateCartUI(); 
  } else {
    console.error("Error: Supabase global object or createClient function not found. Is Supabase SDK loaded correctly?");
  }
});

document.getElementById('currentYear').textContent = new Date().getFullYear();