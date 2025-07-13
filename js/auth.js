


const SUPABASE_URL = 'https://lekxtacqnusomlvtfxcz.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxla3h0YWNxbnVzb21sdnRmeGN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDU0OTIsImV4cCI6MjA2NTU4MTQ5Mn0.mUGy47EGjDxWKWFl4EPWgYfYnzKB9YaTTYgmRihRQXU';


let supabase;

const authForm = document.getElementById('authForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const repeatPasswordInput = document.getElementById('repeatPassword'); // Added this line
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


async function signUp(email, password) {
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

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
    });

    if (submitButton) {
        submitButton.textContent = 'Sign Up';
        submitButton.disabled = false;
    }

    if (error) {
        console.error('Sign Up Error:', error.message);
        
        showMessage(`Sign Up Failed: ${error.message}`, 'error');
    } else {
        
        
        showMessage(
            'If this is a new email, a confirmation link has been sent to your inbox. If the email is already registered, please try logging in.', 
            'success'
        );
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
        
        window.location.href = 'index.html'; 
    } else {
        showMessage('Login process completed, but no user data. Please try again.', 'info');
    }
}


function handleSubmit(e) {
    e.preventDefault(); 

    if (!emailInput || !passwordInput) {
        console.error("Input elements not found.");
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        showMessage('Please enter both email and password.', 'error');
        return;
    }

    if (isSignUpMode) {
        // Validate repeat password only in Sign Up mode
        if (!repeatPasswordInput) {
            console.error("Repeat password input not found.");
            showMessage('Sign Up requires a repeat password field.', 'error');
            return;
        }

        const repeatPassword = repeatPasswordInput.value.trim();
        if (password !== repeatPassword) {
            showMessage('Passwords do not match.', 'error');
            return;
        }

        signUp(email, password);
    } else {
        signIn(email, password);
    }
}


function handleToggleAuthMode(e) {
    e.preventDefault();
    isSignUpMode = !isSignUpMode;
    hideMessage(); 

    // Toggle visibility of repeat password field based on mode
    if (repeatPasswordInput) {
        // We set display based on whether we are in Sign Up mode (true = block, false = none)
        repeatPasswordInput.style.display = isSignUpMode ? 'flex' : 'none'; 
        repeatPasswordInput.value = ''; // Clear the input field
    }

    // Update form text and clear inputs
    if (formTitle && submitButton && toggleAuthMode && passwordInput && emailInput) {
        if (isSignUpMode) {
            formTitle.textContent = 'Sign Up';
            submitButton.textContent = 'Sign Up';
            toggleAuthMode.textContent = 'Log In';
        } else {
            formTitle.textContent = 'Log In';
            submitButton.textContent = 'Log In';
            toggleAuthMode.textContent = 'Sign Up';
        }
        
        passwordInput.value = '';
        emailInput.value = ''; 
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
        
        window.location.href = 'index.html'; 
    } else if (error) {
        console.error('Error getting session:', error.message);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("Supabase client initialized in auth.js.");
        checkUserSession(); 
    } else {
        console.error("Error: Supabase SDK not available. Cannot initialize auth.js.");
        showMessage("Auth service is currently unavailable. Please load Supabase SDK.", 'error');
    }

    // Ensure initial visibility of repeatPasswordInput based on isSignUpMode (which is true by default)
    if (repeatPasswordInput) {
        repeatPasswordInput.style.display = isSignUpMode ? 'flex' : 'none';
    }

    
    if (authForm) {
        authForm.addEventListener('submit', handleSubmit);
    }
    if (toggleAuthMode) {
        toggleAuthMode.addEventListener('click', handleToggleAuthMode);
    }
});