


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
        
        userEmailDisplay.textContent = user.email; 
        
        
        if (userProfileStatus) {
            
            userProfileStatus.style.display = 'flex'; 
        }
        if (authButton) {
            authButton.style.display = 'none';
        }
    } else {
        
        userEmailDisplay.textContent = ''; 
        
        
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