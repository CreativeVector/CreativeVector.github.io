const SUPABASE_URL = 'https://lekxtacqnusomlvtfxcz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxla3h0YWNxbnVzb21sdnRmeGN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDU0OTIsImV4cCI6MjA2NTU4MTQ5Mn0.mUGy47EGjDxWKWFl4EPWgYfYnzKB9YaTTYgmRihRQXU';


let supabase;

const authForm = document.getElementById('authForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const repeatPasswordInput = document.getElementById('repeatPassword');

const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const countryCodeSelect = document.getElementById('countryCode');
const phoneNumberInput = document.getElementById('phoneNumber');

const submitButton = document.getElementById('submitButton');
const authMessage = document.getElementById('authMessage');
const formTitle = document.getElementById('formTitle');
const toggleAuthMode = document.getElementById('toggleAuthMode');

let isSignUpMode = true;

function showMessage(message, type = 'info') {
    if (authMessage) {
        authMessage.textContent = message;
        authMessage.className = `message ${type}`;
        authMessage.style.display = 'block';
    }
}


function hideMessage() {
    if (authMessage) {
        authMessage.style.display = 'none';
        authMessage.textContent = '';
    }
}


async function signUp(email, password, firstName, lastName, fullPhoneNumber) {
    if (!supabase) {
        console.error("Supabase client is not initialized.");
        showMessage("Auth service is unavailable. Please try again later.", 'error');
        return;
    }

    hideMessage();
    if (submitButton) {
        submitButton.textContent = 'Signing Up...';
        submitButton.disabled = true;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
    });

    if (authError) {
        console.error('Sign Up Error:', authError.message);
        showMessage(`Sign Up Failed: ${authError.message}`, 'error');
        if (submitButton) {
            submitButton.textContent = 'Sign Up';
            submitButton.disabled = false;
        }
        return;
    }

    // Jika pendaftaran berhasil atau pengguna sudah ada (misal melalui signInWithOtp setelah signUp)
    if (authData.user) {
        // Simpan data tambahan ke tabel CustomerData
        const { data: customerData, error: customerError } = await supabase
            .from('CustomerData') // Pastikan nama tabel ini sama dengan yang Anda buat di Supabase
            .insert([
                {
                    user_id: authData.user.id,
                    first_name: firstName,
                    last_name: lastName,
                    phone_number: fullPhoneNumber,
                    email: email
                }
            ]);

        if (customerError) {
            console.error('Error saving customer data:', customerError.message);
            // Anda bisa memilih untuk menghapus user yang baru dibuat jika penyimpanan data gagal
            // await supabase.auth.admin.deleteUser(authData.user.id); // Ini membutuhkan role service_role key
            showMessage(`Sign Up successful, but failed to save profile data: ${customerError.message}. Please contact support.`, 'warning');
        } else {
            showMessage(
                'Sign Up successful! A confirmation link has been sent to your inbox.',
                'success'
            );
        }
    } else {
        // Ini akan terjadi jika email sudah terdaftar dan signUp tidak membuat user baru
        showMessage(
            'If this is a new email, a confirmation link has been sent to your inbox. If the email is already registered, please try logging in.',
            'success'
        );
    }

    if (submitButton) {
        submitButton.textContent = 'Sign Up';
        submitButton.disabled = false;
    }
}

async function signIn(email, password) {
    if (!supabase) {
        console.error("Supabase client is not initialized.");
        showMessage("Auth service is unavailable. Please try again later.", 'error');
        return;
    }

    hideMessage();
    if (submitButton) {
        submitButton.textContent = 'Logging In...';
        submitButton.disabled = true;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (submitButton) {
        submitButton.textContent = 'Log In';
        submitButton.disabled = false;
    }

    if (error) {
        console.error('Login Error:', error.message);
        showMessage(`Login Failed: ${error.message}`, 'error');
    } else if (data.user) {
        showMessage('Login successful! Redirecting...', 'success');
        console.log('User logged in:', data.user);

        window.location.href = '/index.html';
    } else {
        showMessage('Login process completed, but no user data. Please try again.', 'info');
    }
}


function handleSubmit(e) {
    e.preventDefault();

    // Pastikan elemen input dasar ada (email, password)
    if (!emailInput || !passwordInput) {
        console.error("Email or password input elements not found.");
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Validasi dasar untuk email dan password (selalu diperlukan)
    if (!email || !password) {
        showMessage('Please enter your email and password.', 'error');
        return;
    }

    if (isSignUpMode) {
        // Validasi khusus untuk mode Sign Up
        if (!firstNameInput || !lastNameInput || !countryCodeSelect || !phoneNumberInput || !repeatPasswordInput) {
            console.error("One or more sign-up input elements not found.");
            showMessage('Sign Up form elements are missing.', 'error');
            return;
        }

        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const countryCode = countryCodeSelect.value;
        const phoneNumber = phoneNumberInput.value.trim();
        const fullPhoneNumber = countryCode + phoneNumber;
        const repeatPassword = repeatPasswordInput.value.trim();

        // Validasi bahwa semua input pendaftaran harus diisi
        if (!firstName || !lastName || !phoneNumber) {
            showMessage('Please fill in your first name, last name, and phone number.', 'error');
            return;
        }

        if (password !== repeatPassword) {
            showMessage('Passwords do not match.', 'error');
            return;
        }

        signUp(email, password, firstName, lastName, fullPhoneNumber);
    } else {
        // Mode Log In tidak memerlukan validasi field tambahan
        signIn(email, password);
    }
}

function handleToggleAuthMode(e) {
    e.preventDefault();
    isSignUpMode = !isSignUpMode;
    hideMessage();

    // Toggle visibility and required status of additional fields based on mode
    if (firstNameInput && lastNameInput && countryCodeSelect && phoneNumberInput && repeatPasswordInput) {
        if (isSignUpMode) {
            firstNameInput.style.display = 'block';
            lastNameInput.style.display = 'block';
            document.querySelector('.phone-input-group').style.display = 'flex'; // Tampilkan kembali div group
            repeatPasswordInput.style.display = 'block';

            firstNameInput.required = true;
            lastNameInput.required = true;
            phoneNumberInput.required = true;
            repeatPasswordInput.required = true;

        } else {
            firstNameInput.style.display = 'none';
            lastNameInput.style.display = 'none';
            document.querySelector('.phone-input-group').style.display = 'none'; // Sembunyikan div group
            repeatPasswordInput.style.display = 'none';

            firstNameInput.required = false;
            lastNameInput.required = false;
            phoneNumberInput.required = false;
            repeatPasswordInput.required = false;
        }
    }

    // Update form text and clear inputs
    if (formTitle && submitButton && toggleAuthMode && passwordInput && emailInput) {
        const toggleForm = document.querySelector('.toggle-form'); // ambil div toggle-form utama

        if (isSignUpMode) {
            formTitle.textContent = 'Sign Up';
            submitButton.textContent = 'Sign Up';
            toggleAuthMode.textContent = 'Log In';
            if (toggleForm) {
                toggleForm.firstChild.textContent = 'Already have an account? ';
            }
        } else {
            formTitle.textContent = 'Log In';
            submitButton.textContent = 'Log In';
            toggleAuthMode.textContent = 'Sign Up';
            if (toggleForm) {
                toggleForm.firstChild.textContent = `Don't have a account yet? `;
            }
        }

        passwordInput.value = '';
        emailInput.value = '';
        // Clear new fields on mode switch
        if (firstNameInput) firstNameInput.value = '';
        if (lastNameInput) lastNameInput.value = '';
        if (phoneNumberInput) phoneNumberInput.value = '';
        if (repeatPasswordInput) repeatPasswordInput.value = '';
    }
}


async function checkUserSession() {
    if (!supabase) {
        console.warn("Supabase client not initialized for session check.");
        return;
    }
    const { data: { session }, error } = await supabase.auth.getSession();
    if (session) {
        console.log('User already logged in:', session.user);

        window.location.href = '/index.html';
    } else if (error) {
        console.error('Error getting session:', error.message);
    }
}

async function signInWithGoogle() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth-redirect.html` // arahkan ke halaman redirect milikmu
            }
        });

        if (error) {
            console.error('Google Sign-in Error:', error);
            showMessage('Failed to sign in with Google. Please try again.', 'error');
        } else {
            console.log('Redirecting to Google Auth...');
        }
    } catch (err) {
        console.error('Unexpected error:', err);
        showMessage('Unexpected error occurred during Google login.', 'error');
    }
}

// Tambahkan event listener
document.addEventListener('DOMContentLoaded', () => {
    const googleBtn = document.getElementById('googleLoginBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', signInWithGoogle);
    }
});

document.addEventListener('DOMContentLoaded', () => {

    if (window.supabase && typeof window.supabase.createClient === 'function') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("Supabase client initialized in auth.js.");
        checkUserSession();
    } else {
        console.error("Error: Supabase SDK not available. Cannot initialize auth.js.");
        showMessage("Auth service is currently unavailable. Please load Supabase SDK.", 'error');
    }

    const hash = window.location.hash.toLowerCase();
    if (hash === '#login') {
        isSignUpMode = false;
    } else if (hash === '#signup') {
        isSignUpMode = true;
    }

    // Terapkan mode sesuai hash
    if (!isSignUpMode) {
        // Login mode
        firstNameInput.style.display = 'none';
        lastNameInput.style.display = 'none';
        document.querySelector('.phone-input-group').style.display = 'none';
        repeatPasswordInput.style.display = 'none';
        formTitle.textContent = 'Log In';
        submitButton.textContent = 'Log In';
        toggleAuthMode.textContent = 'Sign Up';
        document.querySelector('.toggle-form').firstChild.textContent = `Don't have a account yet? `;
    } else {
        // Sign Up mode
        firstNameInput.style.display = 'block';
        lastNameInput.style.display = 'block';
        document.querySelector('.phone-input-group').style.display = 'flex';
        repeatPasswordInput.style.display = 'block';
        formTitle.textContent = 'Sign Up';
        submitButton.textContent = 'Sign Up';
        toggleAuthMode.textContent = 'Log In';
        document.querySelector('.toggle-form').firstChild.textContent = 'Already have an account? ';
    }

    // --- Event listeners ---
    if (authForm) {
        authForm.addEventListener('submit', handleSubmit);
    }
    if (toggleAuthMode) {
        toggleAuthMode.addEventListener('click', handleToggleAuthMode);
    }

    // --- Optional: ubah hash saat toggle ---
    toggleAuthMode.addEventListener('click', () => {
        if (isSignUpMode) {
            window.location.hash = '#signup';
        } else {
            window.location.hash = '#login';
        }
    });
});