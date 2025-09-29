


const supabaseUrl = 'https://lekxtacqnusomlvtfxcz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxla3h0YWNxbnVzb21sdnRmeGN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDU0OTIsImV4cCI6MjA2NTU4MTQ5Mn0.mUGy47EGjDxWKWFl4EPWgYfYnzKB9YaTTYgmRihRQXU';

let supabase;


const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profilePhone = document.getElementById('profilePhone');
const historyMessage = document.getElementById('historyMessage');
const historyTable = document.getElementById('historyTable');
const historyTableBody = document.getElementById('historyTableBody');
const changeDetailsButton = document.getElementById('changeDetailsButton');

document.addEventListener('DOMContentLoaded', async () => {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        console.log("Supabase client initialized in profile.js.");
    } else {
        console.error("Supabase SDK not available. Cannot initialize profile.js.");
        showAlert("Profile service is currently unavailable. Please load Supabase SDK.", 'error');
        return;
    }

    await loadUserProfileAndHistory();
    loadProfileData();

    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    if (changeDetailsButton) {
        changeDetailsButton.addEventListener('click', () => {
            showAlert('Leads to the profile edit page (not yet implemented).', 'info');
            // window.location.href = '/edit-profile.html'; // Contoh: arahkan ke halaman edit profil
        });
    }
});
async function loadUserPreferences(userId) {
    const { data, error } = await supabase
        .from("CustomerData")
        .select("data_content")
        .eq("id", userId)
        .single();

    if (error || !data) {
        console.error("Failed to load user preferences:", error);
        return;
    }

    const content = data.data_content || {};
    renderList("likesList", content.likes || []);
    renderList("wishlistList", content.wishlist || []);
}

function renderList(containerId, items) {
    const container = document.getElementById(containerId);
    if (!items.length) {
        container.textContent = "No items yet.";
        return;
    }
    container.innerHTML = items
        .map(item => `<div class="profile-item">Product ID: ${item}</div>`)
        .join("");
}

// panggil saat login
supabase.auth.getUser().then(({ data: { user } }) => {
    if (user) {
        loadUserPreferences(user.id);
    }
});

async function loadUserProfileAndHistory() {
    // 1. Dapatkan sesi pengguna saat ini
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        console.log("User not logged in. Redirecting to auth.html");
        showAlert('You dont enter.Please come in to see your profile.', 'info');
        window.location.href = 'auth.html';
        return;
    }

    // Tampilkan email dari data sesi Supabase Auth
    profileEmail.textContent = user.email || 'N/A';

    // 2. Ambil data tambahan dari tabel CustomerData
    const { data: customerData, error: customerDataError } = await supabase
        .from('CustomerData')
        .select('first_name, last_name, phone_number')
        .eq('user_id', user.id)
        .single(); // Gunakan single() karena user_id harus unik

    if (customerDataError && customerDataError.code !== 'PGRST116') { // PGRST116 berarti "Tidak ada baris ditemukan"
        console.error('Error fetching customer data:', customerDataError.message);
        showAlert('Failed to load the full profile details.Data may be lost.', 'warning');
        profileName.textContent = 'N/A';
        profilePhone.textContent = 'N/A';
    } else if (customerData) {
        // Gabungkan nama depan dan belakang untuk profileName
        profileName.textContent = `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim();
        // Tampilkan nomor telepon
        profilePhone.textContent = customerData.phone_number || 'N/A';
    } else {
        // Jika tidak ada data CustomerData ditemukan
        console.warn('Customer data is not found for this user.');
        showAlert('Additional profile data (name, telephone) is lost.Please update your profile.', 'info');
        profileName.textContent = 'N/A';
        profilePhone.textContent = 'N/A';
    }

    // 3. Lanjutkan dengan mengambil riwayat pembelian (sama seperti sebelumnya)
    const { data: salesRecords, error: recordsError } = await supabase
        .from('sales_records')
        .select('transaction_id, created_at, order_files, amount, currency, payer_name, payment_status')
        .eq('payer_email', user.email)
        .order('created_at', { ascending: false });

    if (recordsError) {
        console.error('Error fetching sales records:', recordsError.message);
        historyMessage.textContent = 'Failed to load purchase history.';
        historyMessage.style.color = 'red';
        return;
    }

    if (salesRecords && salesRecords.length > 0) {
        historyTable.style.display = 'table';
        historyMessage.style.display = 'none';
        renderPurchaseHistory(salesRecords);
    } else {
        historyMessage.textContent = 'You dont have a purchase history.';
        historyTable.style.display = 'none';
    }
}

function renderPurchaseHistory(records) {
    historyTableBody.innerHTML = '';

    records.forEach(record => {
        const row = document.createElement('tr');

        const orderDate = new Date(record.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        let itemsHtml = '<ul class="history-item-detail">';
        let licenseHtml = '<ul class="history-item-detail">';
        if (record.order_files && Array.isArray(record.order_files)) {
            record.order_files.forEach(file => {
                const title = file.title || 'Untitled';
                const truncatedTitle = title.length > 20 ? title.slice(0, 20) + '...' : title;
                itemsHtml += `<li>${truncatedTitle} (${file.filename || 'N/A'})</li>`;
                licenseHtml += `<li>${file.license || 'N/A'}</li>`;
            });
        } else {
            itemsHtml += `<li>N/A (Order files unavailable)</li>`;
            licenseHtml += `<li>N/A (License unavailable)</li>`; // Perbaikan typo: licenseHtm menjadi licenseHtml
        }
        itemsHtml += '</ul>';
        licenseHtml += '</ul>'; // Tutup tag <ul> untuk licenseHtml

        const totalAmount = `${record.currency || '$'} ${parseFloat(record.amount).toFixed(2)}`;
        const transactionId = record.transaction_id ? record.transaction_id.slice(0, 8) : 'N/A';

        row.innerHTML = `
            <td>#${transactionId}</td>
            <td>${orderDate}</td>
            <td>${itemsHtml}</td>
            <td>${licenseHtml}</td>
            <td>${totalAmount}</td>
            <td>${record.payment_status || 'N/A'}</td> `;
        historyTableBody.appendChild(row);
    });
}
// loadUserCollection: gunakan RPC get_user_collection yang mengembalikan
// [{ filename, title, preview_url }, ...]
async function loadUserCollection(userId, field, containerId) {
  try {
    const { data, error } = await supabase
      .rpc('get_user_collection', { p_user_id: userId, p_field: field });

    if (error) throw error;

    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (!data || data.length === 0) {
      container.innerHTML = `<p>No ${field} yet.</p>`;
      return;
    }

    // build grid: gunakan DOM API untuk menghindari injection
    data.forEach(item => {
      const filename = item.filename || '';
      const title = item.title || filename;
      const preview = item.preview_url || 'img/placeholder.png';

      const link = document.createElement('a');
      // link ke produk (sama dengan struktur produk di site Anda)
      link.href = `/products/${encodeURIComponent(filename)}.html`;
      // buka di tab yang sama; kalau mau new tab: set target='_blank' rel='noopener'
      link.className = 'thumb-link';
      link.title = title;

      const card = document.createElement('div');
      card.className = 'thumb-card';

      const img = document.createElement('img');
      img.className = 'thumb-img';
      img.src = preview;
      img.alt = title;

      const t = document.createElement('p');
      t.className = 'thumb-title';
      t.textContent = title;

      card.appendChild(img);
      card.appendChild(t);
      link.appendChild(card);
      container.appendChild(link);
    });

  } catch (err) {
    console.error(`Failed to load ${field}:`, err);
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = `<p>Error loading ${field}.</p>`;
  }
}


async function loadProfileData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = '/auth.html';
        return;
    }

    try {
        await loadUserCollection(user.id, 'likes', 'likesContainer');
        await loadUserCollection(user.id, 'wishlist', 'wishlistContainer');
    } catch (err) {
        console.error('loadProfileData error', err);
    }
}


