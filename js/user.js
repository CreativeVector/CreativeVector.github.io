


const supabaseUrl = 'https://lekxtacqnusomlvtfxcz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxla3h0YWNxbnVzb21sdnRmeGN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDU0OTIsImV4cCI6MjA2NTU4MTQ5Mn0.mUGy47EGjDxWKWFl4EPWgYfYnzKB9YaTTYgmRihRQXU';

let supabase;


const authButton = document.getElementById('authButton');
const logoutButton = document.getElementById('logoutButton');
const userEmailDisplay = document.getElementById('userEmailDisplay');
const userProfileStatus = document.getElementById('userProfileStatus');
const userProfileLink = document.getElementById('userProfileLink');


document.addEventListener('DOMContentLoaded', () => {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        console.log("Supabase client initialized successfully in user.js.");


        supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth state changed:", event, session);
            updateAuthUI();
        });


        updateAuthUI();

    } else {
        console.error("Error: Supabase global object or createClient function not found. Please ensure Supabase SDK is loaded.");
    }
});


async function updateAuthUI() {
    if (!supabase) {
        console.warn("Supabase client not initialized yet for updateAuthUI.");
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // Pengguna login: Ambil nama lengkap dari CustomerData
        const { data: customerData, error: customerDataError } = await supabase
            .from('CustomerData')
            .select('first_name, last_name')
            .eq('user_id', user.id)
            .single();

        if (customerDataError && customerDataError.code !== 'PGRST116') { // PGRST116 means "No rows found"
            console.error('Error fetching customer data for display:', customerDataError.message);
            userEmailDisplay.textContent = user.email; // Fallback ke email jika ada error
            // showAlert('Gagal memuat nama profil.', 'warning'); // Jika Anda memiliki showAlert global
        } else if (customerData) {
            // Tampilkan nama lengkap jika ditemukan
            userEmailDisplay.textContent = `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim();
        } else {
            // Jika data CustomerData tidak ditemukan (misal, pengguna lama sebelum fitur ini ada)
            userEmailDisplay.textContent = user.email; // Fallback ke email
            // showAlert('Nama profil tidak ditemukan, menampilkan email.', 'info'); // Jika Anda memiliki showAlert global
        }

        if (userProfileStatus) {
            userProfileStatus.style.display = 'flex'; // Atau 'block', tergantung CSS Anda
        }
        if (authButton) {
            authButton.style.display = 'none';
        }
    } else {
        // Pengguna belum login
        userEmailDisplay.textContent = ''; // Kosongkan tampilan nama/email
        if (userProfileStatus) {
            userProfileStatus.style.display = 'none';
        }
        if (authButton) {
            authButton.style.display = 'inline-block';
        }
    }
}

async function handleLogout(event) {
    if (event) event.preventDefault();
    if (!supabase) {
        console.error("Supabase client not initialized for logout.");
        return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Logout Error:', error.message);
        showAlert('Failed to logout: ' + error.message, 'error');
    } else {
        console.log('User logged out.');

        window.location.href = '/index.html';
    }
}



if (authButton) {
    authButton.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href = '/auth.html';
    });
}

if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
}