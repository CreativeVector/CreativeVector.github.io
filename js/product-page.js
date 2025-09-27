// js/product-page.js
const SUPABASE_URL = 'https://lekxtacqnusomlvtfxcz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxla3h0YWNxbnVzb21sdnRmeGN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDU0OTIsImV4cCI6MjA2NTU4MTQ5Mn0.mUGy47EGjDxWKWFl4EPWgYfYnzKB9YaTTYgmRihRQXU';
const TABLE_NAME = 'StorePreview';

let supabase;
let productData = null;
let selectedLicense = 'personal';

// Dapatkan elemen-elemen HTML
const personalPriceDisplay = document.getElementById('personalPriceDisplay');
const commercialPriceDisplay = document.getElementById('commercialPriceDisplay');
const extendedPriceDisplay = document.getElementById('extendedPriceDisplay');
const licenseSelector = document.getElementById('licenseSelector');
const addToCartButton = document.getElementById('addToCartButton');
const postToInstagramButton = document.getElementById('postToInstagramButton');
const instagramModal = document.getElementById('instagramModal');
const downloadImageLink = document.getElementById('downloadImageLink');
const instagramCaptionTextarea = document.getElementById('instagramCaptionTextarea');

if (postToInstagramButton) {
    postToInstagramButton.addEventListener('click', generateInstagramPost);
}


// Fungsi baru untuk menutup modal
window.closeInstagramModal = function () {
    if (instagramModal) {
        instagramModal.style.display = 'none';
    }
}

// Fungsi baru untuk menyalin caption
window.copyCaption = function () {
    if (instagramCaptionTextarea) {
        instagramCaptionTextarea.select();
        document.execCommand('copy');
        showAlert('Caption copied to clipboard!', 'success');
    }
}
window.openImagePreview = function (imageUrl) {
    const popup = document.getElementById('imgPreviewPopup');
    const popupImage = document.getElementById('popupImage');
    if (popup && popupImage) {
        popupImage.src = imageUrl;
        popup.style.display = 'flex';
    }
}

window.closeImagePreview = function () {
    const popup = document.getElementById('imgPreviewPopup');
    if (popup) {
        popup.style.display = 'none';
    }
}
document.addEventListener('DOMContentLoaded', function () {
    const keywordContainer = document.querySelector('.preview-keyword');
    if (keywordContainer && keywordContainer.textContent.trim() !== '') {
        const rawKeywords = keywordContainer.textContent.trim();
        keywordContainer.textContent = '';
        const keywordsArray = rawKeywords.split(',');
        keywordsArray.forEach(keyword => {
            const trimmedKeyword = keyword.trim();
            if (trimmedKeyword) {
                const keywordLink = document.createElement('a');
                keywordLink.classList.add('keyword-item');
                keywordLink.href = `/?filter_keyword=${encodeURIComponent(trimmedKeyword)}`;
                keywordLink.textContent = trimmedKeyword;
                keywordLink.style.marginRight = '6px';
                keywordLink.style.textDecoration = 'none';
                keywordContainer.appendChild(keywordLink);
            }
        });
    }

    const categoryButton = document.querySelector('.category-search');
    if (categoryButton) {
        const categoryText = categoryButton.textContent.trim();
        categoryButton.onclick = () => {
            window.location.href = `/?category=${encodeURIComponent(categoryText)}`;
        };
    }
});
// Fungsi utama untuk membuat postingan Instagram
async function generateInstagramPost() {
    if (!productData) {
        showAlert("Product data not loaded. Please wait.", "error");
        return;
    }

    // Mendapatkan data produk
    const title = productData.title || 'CreativeVector';
    const filename = productData.filename || 'asset';
    const keywords = productData.keyword || '';
    const imageUrl = productData.preview_url || '';

    const downloadFileName = `${title.replace(/\s+/g, '-')}-${filename}.jpg`;
    const postTitle = `${title} (ID #${filename})`;

    // Memformat keywords menjadi hashtag
    let hashtags = '';
    if (keywords) {
        const hashtagArray = keywords
            .split(',')
            .map(k => `#${k.trim().replace(/\s+/g, '')}`)
            .filter(k => k.length > 1); // Pastikan tidak ada hashtag kosong

        // Batasi maksimal 30 hashtag
        hashtags = hashtagArray.slice(0, 25).join(' ');
    }

    // Menggabungkan semuanya menjadi satu caption
    const fullCaption = `${postTitle}\n\nCheck out this design on our store: https://creativevector.store/products/${filename}.html\n\n${hashtags}`;

    // Mengisi modal dengan data
    if (downloadImageLink) {
        downloadImageLink.href = imageUrl;
        downloadImageLink.setAttribute('download', downloadFileName);
    }
    if (instagramCaptionTextarea) {
        instagramCaptionTextarea.value = fullCaption;
    }
    if (instagramModal) {
        instagramModal.style.display = 'flex';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Pastikan Supabase sudah diinisialisasi oleh product.js
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.error("Supabase SDK not available. Cannot initialize product-page.js.");
        showAlert("Product page service is unavailable. Please load Supabase SDK.", 'error');
        return;
    }

    // Ambil filename dari URL (misal: /products/filename.html -> filename)
    const pathSegments = window.location.pathname.split('/');
    const filenameWithHtml = pathSegments[pathSegments.length - 1];
    const filename = filenameWithHtml.replace('.html', '');

    if (filename) {
        await fetchAndRenderProductDetails(filename);
    } else {
        console.error("Product filename not found in URL.");
        showAlert("Failed to load product details. Product ID missing.", "error");
        return;
    }

    // Inisialisasi license dari selector
    selectedLicense = licenseSelector.value;

    // Tambahkan event listener untuk license selector
    if (licenseSelector) {
        licenseSelector.addEventListener('change', (event) => {
            selectedLicense = event.target.value;
            renderPrices(); // Render ulang harga saat license berubah
        });
    }

    // Tambahkan event listener untuk tombol Add to Cart
    if (addToCartButton) {
        addToCartButton.addEventListener('click', addToCartFromTemplate);
    }
});

async function fetchAndRenderProductDetails(filename) {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('filename', filename)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // No rows found
                showAlert("Product not found.", "error");
            } else {
                showAlert(`Error loading product: ${error.message}`, "error");
            }
            console.error('Error fetching product details:', error.message);
            return;
        }

        productData = data; // Simpan data produk secara global
        renderPrices(); // Tampilkan harga awal
    } catch (err) {
        console.error('Unexpected error fetching product details:', err);
        showAlert("An unexpected error occurred while loading product.", "error");
    }
}

function renderPrices() {
    if (!productData) {
        console.warn("Product data not available to render prices.");
        return;
    }

    // Dapatkan mata uang yang sedang aktif dari localStorage
    const currentCurrency = localStorage.getItem('currentCurrency') || 'USD';
    const currencySymbol = (currentCurrency === 'USD') ? '$' : 'Rp';

    // Tentukan harga berdasarkan mata uang
    const personalPrice = (currentCurrency === 'USD') ? productData.price : productData.idr_price;
    const commercialPrice = (currentCurrency === 'USD') ? productData.price_commercial : productData.idr_commercial;
    const extendedPrice = (currentCurrency === 'USD') ? productData.price_extended : productData.idr_extended;

    // Format harga
    const formatPrice = (price) => {
        if (price === undefined || price === null) return 'N/A';
        return `${currencySymbol} ${parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Update tampilan harga
    if (personalPriceDisplay) personalPriceDisplay.textContent = formatPrice(personalPrice);
    if (commercialPriceDisplay) commercialPriceDisplay.textContent = formatPrice(commercialPrice);
    if (extendedPriceDisplay) extendedPriceDisplay.textContent = formatPrice(extendedPrice);
}

function addToCartFromTemplate() {
    if (!productData) {
        showAlert("Product data not loaded yet. Please try again.", "error");
        return;
    }

    const currentCurrency = localStorage.getItem('currentCurrency') || 'USD';
    let priceUSD = 0;
    let priceIDR = 0;

    // Hitung harga sesuai license
    switch (selectedLicense) {
        case 'commercial':
            priceUSD = parseFloat(productData.price_commercial) || 0;
            priceIDR = parseFloat(productData.idr_commercial) || 0;
            break;
        case 'extended':
            priceUSD = parseFloat(productData.price_extended) || 0;
            priceIDR = parseFloat(productData.idr_extended) || 0;
            break;
        default: // personal
            priceUSD = parseFloat(productData.price) || 0;
            priceIDR = parseFloat(productData.idr_price) || 0;
            break;
    }

    const productForCart = {
        title: productData.title,
        filename: productData.filename,
        license: selectedLicense,
        preview_url: productData.preview_url,
        extractedId: productData.filename,
        selectedCurrency: currentCurrency,

        // simpan harga sesuai format yang dipakai updateCartUI
        price_usd: priceUSD,
        price_idr: priceIDR,
        price: (currentCurrency === 'USD' ? priceUSD : priceIDR)
    };

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const exists = cart.find(p =>
        p.filename === productForCart.filename &&
        p.license === productForCart.license
    );

    if (exists) {
        showAlert(`"${productForCart.title}" with "${productForCart.license}" license is already in your cart.`, "info");
        return;
    }

    cart.push(productForCart);
    localStorage.setItem('cart', JSON.stringify(cart));
    showAlert("Added to cart.", "success");

    if (typeof updateCartUI === 'function') {
        updateCartUI();
    } else {
        console.warn("updateCartUI function not found. Cart UI may not update.");
    }
}
