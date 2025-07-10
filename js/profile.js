


const supabaseUrl = 'https://lekxtacqnusomlvtfxcz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxla3h0YWNxbnVzb21sdnRmeGN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDU0OTIsImV4cCI6MjA2NTU4MTQ5Mn0.mUGy47EGjDxWKWFl4EPWgYfYnzKB9YaTTYgmRihRQXU';

let supabase;


const profileEmail = document.getElementById('profileEmail');
const historyMessage = document.getElementById('historyMessage');
const historyTable = document.getElementById('historyTable');
const historyTableBody = document.getElementById('historyTableBody');

document.addEventListener('DOMContentLoaded', async () => {
    
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    } else {
        console.error("Supabase SDK not available.");
        return;
    }

    
    await loadUserProfileAndHistory();
});

async function loadUserProfileAndHistory() {
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        
        console.log("User not logged in. Redirecting to auth.html");
        window.location.href = 'auth.html'; 
        return;
    }

    
    profileEmail.textContent = user.email;

    
    
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
        historyMessage.textContent = 'You have no purchase history yet.';
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
            licenseHtm += `<li>N/A (License unavailable)</li>`;
        }
        itemsHtml += '</ul>';

        
        const totalAmount = `${record.currency || '$'} ${parseFloat(record.amount).toFixed(2)}`;

        
        const transactionId = record.transaction_id ? record.transaction_id.slice(0, 8) : 'N/A';

        row.innerHTML = `
            <td>#${transactionId}</td>
            <td>${orderDate}</td>
            <td>${itemsHtml}</td>
            <td>${licenseHtml}</td>
            <td>${totalAmount}</td>
        `;
        historyTableBody.appendChild(row);
    });
}