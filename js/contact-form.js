const contactForm = document.getElementById('contactForm');
const contactMessage = document.getElementById('contactMessage');

contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    hideContactMessage();

    if (!name || !email || !subject || !message) {
        showContactMessage('Please fill in all fields.', 'error');
        return;
    }

    showContactMessage('Sending your message...', 'info');

    try {
        const response = await fetch('https://lekxtacqnusomlvtfxcz.supabase.co/functions/v1/contact-email-ts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, subject, message })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Unknown error');
        }

        showContactMessage('Thank you for your message! We will get back to you soon.', 'success');
        contactForm.reset();
    } catch (error) {
        console.error('Error submitting contact form:', error.message);
        showContactMessage(`Failed to send message: ${error.message}`, 'error');
    }

});

function showContactMessage(msg, type) {
    contactMessage.textContent = msg;
    contactMessage.className = `auth-modal-message ${type}`;
    contactMessage.style.display = 'block';
}

function hideContactMessage() {
    contactMessage.style.display = 'none';
    contactMessage.textContent = '';
    contactMessage.className = '';
}
