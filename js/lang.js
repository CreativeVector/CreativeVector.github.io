// js/lang.js

// Objek terjemahan
const translations = {
    en: {
        nav: {
            store: "Store",
            license: "License Agreement",
            about: "About",
            contact: "Contact",
            faq: "FAQ"
        },
        user: {
            profile: "My Profile",
            logout: "Logout",
            login: "Login",
            signup: "Sign Up"
        },
        footer: {
            description: "Your one-stop shop for high-quality digital assets. We offer unique designs for personal and commercial projects, ensuring creativity and value in every product.",
            ownership: "All digital assets displayed here are purely owned by Alextian Creative Artwork, we do not sell or steal other designers digital assets.",
            quick_links: "Quick Links",
            privacy_policy: "Privacy Policy",
            terms_of_service: "Terms of Service"
        },
        // Tambahkan terjemahan untuk halaman About Us
        about: {
            hero_title: "About CreativeVector",
            hero_tagline: "Empowering Creativity, One Vector at a Time.",
            story_title: "Our Story",
            story_paragraph1: "Welcome to CreativeVector, your go-to destination for premium quality digital assets. Born from a passion for art and design, CreativeVector was founded by Alextian Creative Artwork with a simple yet powerful vision: to provide designers, marketers, and creative enthusiasts with unique, high-quality vector graphics that elevate their projects.",
            story_paragraph2: "In a world saturated with generic stock images, we recognized the need for truly original and inspiring vector art. Our journey began with a commitment to craftsmanship, attention to detail, and a deep understanding of what makes a design truly stand out. Every vector you find here is meticulously crafted, ensuring it meets the highest standards of aesthetic appeal and usability.",
            mission_values_title: "Our Mission & Values",
            mission_paragraph: "Our mission is to empower creativity across the globe by providing accessible, versatile, and stunning vector graphics. We believe that exceptional design should be within everyone's reach, whether you're a seasoned professional or just starting your creative journey.",
            values_heading: "Our Core Values:",
            values_quality: "Quality & Originality: We pride ourselves on delivering only the best. Each asset is original and designed with precision.",
            values_inspiration: "Inspiration & Innovation: We constantly explore new trends and techniques to keep our collection fresh and inspiring.",
            values_integrity: "Integrity & Trust: Transparency in licensing and fair pricing are at the core of our business.",
            values_community: "Community Focus: We aim to build a community where creativity flourishes and designers can find the perfect tools for their vision.",
            different_title: "What Makes Us Different?",
            unique_designs_heading: "Unique Designs",
            unique_designs_text: "No generic stock. Our artists create exclusive, handcrafted vectors you won't find anywhere else.",
            flexible_licensing_heading: "Flexible Licensing",
            flexible_licensing_text: "Personal, Commercial, and Extended licenses designed to fit your project needs perfectly.",
            dedicated_support_heading: "Dedicated Support",
            dedicated_support_text: "Our team is here to assist you with any questions or support you might need.",
            regular_updates_heading: "Regular Updates",
            regular_updates_text: "We continuously add new designs and expand our collection to keep your projects fresh.",
            cta_title: "Ready to Explore Our Collection?",
            cta_text: "Join thousands of happy creatives who trust CreativeVector for their design needs.",
            cta_button: "Browse All Vectors"
        },
        // --- Contoh untuk Halaman Auth.html ---
        auth: {
            title_login: "Login",
            title_signup: "Sign Up",
            email_placeholder: "Email",
            password_placeholder: "Password",
            submit_login: "Login",
            submit_signup: "Sign Up",
            no_account: "Don't have an account?",
            switch_to_signup: "Sign Up",
            have_account: "Already have an account?",
            switch_to_login: "Login",
            supabase_info: "CreativeVector uses Supabase Authentication to keep your data secure and private."
        },
        // ... tambahkan terjemahan untuk halaman dan elemen lain
    },
    id: {
        nav: {
            store: "Toko",
            license: "Perjanjian Lisensi",
            about: "Tentang Kami",
            contact: "Kontak",
            faq: "FAQ"
        },
        user: {
            profile: "Profil Saya",
            logout: "Keluar",
            login: "Masuk",
            signup: "Daftar"
        },
        footer: {
            description: "Toko serba ada untuk aset digital berkualitas tinggi. Kami menawarkan desain unik untuk proyek pribadi dan komersial, memastikan kreativitas dan nilai di setiap produk.",
            ownership: "Semua aset digital yang ditampilkan di sini sepenuhnya dimiliki oleh Alextian Creative Artwork, kami tidak menjual atau mencuri aset digital desainer lain.",
            quick_links: "Tautan Cepat",
            privacy_policy: "Kebijakan Privasi",
            terms_of_service: "Syarat & Ketentuan Layanan"
        },
        // Tambahkan terjemahan untuk halaman About Us
        about: {
            hero_title: "Tentang CreativeVector",
            hero_tagline: "Memberdayakan Kreativitas, Satu Vektor pada Satu Waktu.",
            story_title: "Kisah Kami",
            story_paragraph1: "Selamat datang di CreativeVector, tujuan utama Anda untuk aset digital berkualitas premium. Lahir dari gairah akan seni dan desain, CreativeVector didirikan oleh Alextian Creative Artwork dengan visi sederhana namun kuat: menyediakan grafis vektor unik dan berkualitas tinggi yang meningkatkan proyek para desainer, pemasar, dan penggemar kreatif.",
            story_paragraph2: "Di dunia yang dibanjiri gambar stok generik, kami menyadari kebutuhan akan seni vektor yang benar-benar orisinal dan menginspirasi. Perjalanan kami dimulai dengan komitmen pada keahlian, perhatian terhadap detail, dan pemahaman mendalam tentang apa yang membuat desain benar-benar menonjol. Setiap vektor yang Anda temukan di sini dibuat dengan cermat, memastikan memenuhi standar estetika dan kegunaan tertinggi.",
            mission_values_title: "Misi & Nilai Kami",
            mission_paragraph: "Misi kami adalah memberdayakan kreativitas di seluruh dunia dengan menyediakan grafis vektor yang mudah diakses, serbaguna, dan menakjubkan. Kami percaya bahwa desain luar biasa harus dapat dijangkau oleh semua orang, baik Anda seorang profesional berpengalaman maupun baru memulai perjalanan kreatif Anda.",
            values_heading: "Nilai-nilai Inti Kami:",
            values_quality: "Kualitas & Orisinalitas: Kami bangga hanya memberikan yang terbaik. Setiap aset adalah asli dan dirancang dengan presisi.",
            values_inspiration: "Inspirasi & Inovasi: Kami terus-menerus menjelajahi tren dan teknik baru untuk menjaga koleksi kami tetap segar dan menginspirasi.",
            values_integrity: "Integritas & Kepercayaan: Transparansi dalam lisensi dan harga yang adil adalah inti dari bisnis kami.",
            values_community: "Fokus Komunitas: Kami bertujuan membangun komunitas di mana kreativitas berkembang dan desainer dapat menemukan alat yang sempurna untuk visi mereka.",
            different_title: "Apa yang Membuat Kami Berbeda?",
            unique_designs_heading: "Desain Unik",
            unique_designs_text: "Tidak ada stok generik. Seniman kami menciptakan vektor eksklusif buatan tangan yang tidak akan Anda temukan di tempat lain.",
            flexible_licensing_heading: "Lisensi Fleksibel",
            flexible_licensing_text: "Lisensi Pribadi, Komersial, dan Diperpanjang dirancang agar sesuai dengan kebutuhan proyek Anda dengan sempurna.",
            dedicated_support_heading: "Dukungan Khusus",
            dedicated_support_text: "Tim kami siap membantu Anda dengan pertanyaan atau dukungan apa pun yang Anda butuhkan.",
            regular_updates_heading: "Pembaruan Berkala",
            regular_updates_text: "Kami terus menambahkan desain baru dan memperluas koleksi kami untuk menjaga proyek Anda tetap segar.",
            cta_title: "Siap Menjelajahi Koleksi Kami?",
            cta_text: "Bergabunglah dengan ribuan pekerja kreatif yang puas yang mempercayai CreativeVector untuk kebutuhan desain mereka.",
            cta_button: "Jelajahi Semua Vektor"
        },
        // --- Contoh untuk Halaman Auth.html ---
        auth: {
            title_login: "Masuk",
            title_signup: "Daftar",
            email_placeholder: "Email",
            password_placeholder: "Kata Sandi",
            submit_login: "Masuk",
            submit_signup: "Daftar",
            no_account: "Belum punya akun?",
            switch_to_signup: "Daftar",
            have_account: "Sudah punya akun?",
            switch_to_login: "Masuk",
            supabase_info: "CreativeVector menggunakan Autentikasi Supabase untuk menjaga data Anda tetap aman dan pribadi."
        },
        // ... tambahkan terjemahan untuk halaman dan elemen lain
    }
};

const langToggleBtn = document.getElementById('langToggle');
const currentLang = localStorage.getItem('lang') || 'en'; // Default ke 'en' jika belum ada

// Fungsi untuk mendapatkan teks terjemahan berdasarkan kunci
function getTranslation(key) {
    const keys = key.split('.');
    let text = translations[currentLang];
    for (const k of keys) {
        if (text && text[k] !== undefined) {
            text = text[k];
        } else {
            return `[${key}]`; // Fallback jika kunci tidak ditemukan
        }
    }
    return text;
}

// Fungsi untuk menerapkan terjemahan ke elemen HTML
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translatedText = getTranslation(key);

        // Jika elemen adalah input dengan placeholder
        if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
            element.setAttribute('placeholder', translatedText);
        } else {
            element.textContent = translatedText;
        }
    });

    // Perbarui teks tombol toggle
    if (langToggleBtn) {
        langToggleBtn.textContent = currentLang === 'en' ? 'EN / ID' : 'ID / EN';
    }

    // Perbarui judul halaman secara dinamis (penting untuk SEO/UX)
    updatePageTitle(currentLang);
}

// Fungsi untuk memperbarui judul halaman berdasarkan bahasa
function updatePageTitle(lang) {
    const path = window.location.pathname.split('/').pop(); // Mendapatkan nama file HTML
    let titleKey;

    switch (path) {
        case 'index.html':
        case '': // Untuk root domain
            titleKey = lang === 'en' ? 'Premium Quality Vectors | CreativeVector' : 'Vektor Kualitas Premium | CreativeVector';
            break;
        case 'about.html':
            titleKey = lang === 'en' ? 'About Us | CreativeVector' : 'Tentang Kami | CreativeVector';
            break;
        case 'license.html':
            titleKey = lang === 'en' ? 'License Agreement | CreativeVector' : 'Perjanjian Lisensi | CreativeVector';
            break;
        case 'checkout.html':
            titleKey = lang === 'en' ? 'Checkout | CreativeVector' : 'Pembayaran | CreativeVector';
            break;
        case 'profile.html':
            titleKey = lang === 'en' ? 'User Profile | CreativeVector' : 'Profil Pengguna | CreativeVector';
            break;
        case 'privacy-policy.html':
            titleKey = lang === 'en' ? 'Privacy Policy | CreativeVector' : 'Kebijakan Privasi | CreativeVector';
            break;
        case 'terms-of-service.html':
            titleKey = lang === 'en' ? 'Terms of Service | CreativeVector' : 'Syarat & Ketentuan Layanan | CreativeVector';
            break;
        case 'auth.html':
            // Ini akan sedikit tricky karena auth.html bisa Login/Signup
            // Untuk sederhana, kita bisa set default atau tidak ganti
            const formTitle = document.getElementById('formTitle');
            if (formTitle && formTitle.textContent.includes('Login')) {
                titleKey = lang === 'en' ? 'Login | CreativeVector' : 'Masuk | CreativeVector';
            } else if (formTitle && formTitle.textContent.includes('Sign Up')) {
                titleKey = lang === 'en' ? 'Sign Up | CreativeVector' : 'Daftar | CreativeVector';
            } else {
                titleKey = lang === 'en' ? 'User Authentication | CreativeVector' : 'Autentikasi Pengguna | CreativeVector';
            }
            break;
        case 'contact.html': // Asumsi Anda punya halaman contact.html
            titleKey = lang === 'en' ? 'Contact Us | CreativeVector' : 'Hubungi Kami | CreativeVector';
            break;
        case 'faq.html': // Asumsi Anda punya halaman faq.html
            titleKey = lang === 'en' ? 'FAQ | CreativeVector' : 'FAQ | CreativeVector';
            break;
        case 'success.html':
            titleKey = lang === 'en' ? 'Payment Successful! | CreativeVector' : 'Pembayaran Berhasil! | CreativeVector';
            break;
        case 'cancel.html':
            titleKey = lang === 'en' ? 'Payment Cancelled | CreativeVector' : 'Pembayaran Dibatalkan | CreativeVector';
            break;
        default:
            titleKey = document.title; // Tetap gunakan judul yang ada jika tidak terdaftar
            break;
    }
    document.title = titleKey;
}


// Event listener untuk tombol toggle
if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
        let newLang = currentLang === 'en' ? 'id' : 'en';
        localStorage.setItem('lang', newLang); // Simpan preferensi bahasa
        location.reload(); // Muat ulang halaman untuk menerapkan bahasa baru
        // Atau panggil applyTranslations() langsung tanpa reload jika semua elemen dimuat
        // applyTranslations(); // Ini lebih cepat tapi butuh semua elemen HTML sudah ada di DOM
    });
}

// Terjemahkan halaman saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    // Di auth.html, perlu memanggil applyTranslations lagi setelah toggle mode form
    // Pastikan user.js atau auth.js memanggil applyTranslations() setelah mengganti teks formTitle
    if (window.location.pathname.includes('auth.html')) {
        const toggleAuthModeLink = document.getElementById('toggleAuthMode');
        if (toggleAuthModeLink) {
            toggleAuthModeLink.addEventListener('click', () => {
                // Beri sedikit delay agar DOM diperbarui oleh auth.js
                setTimeout(applyTranslations, 50);
            });
        }
    }
});

// Ekspor fungsi agar bisa dipanggil dari script lain jika diperlukan
window.getTranslation = getTranslation;
window.applyTranslations = applyTranslations;