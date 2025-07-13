// generate.js

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const supabaseUrl = 'https://lekxtacqnusomlvtfxcz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxla3h0YWNxbnVzb21sdnRmeGN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDU0OTIsImV4cCI6MjA2NTU4MTQ5Mn0.mUGy47EGjDxWKWFl4EPWgYfYnzKB9YaTTYgmRihRQXU';
const tableName = 'StorePreview';

const templatePath = path.join(__dirname, 'template', 'product-template.html');
const outputDir = path.join(__dirname, 'products');

// Ganti ini jika Anda punya folder tujuan lain
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function fetchProducts() {
    const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=*`, {
        headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
        },
    });
    if (!response.ok) {
        throw new Error(`Supabase fetch failed: ${response.statusText}`);
    }
    return await response.json();
}

function generateHtml(template, product) {
    return template
        .replace(/{{TITLE}}/g, product.title || 'Untitled')
        .replace(/{{DESCRIPTION}}/g, product.description || '')
        .replace(/{{PRICE}}/g, product.price.toFixed(2))
        .replace(/{{PRICE_COMMERCIAL}}/g, product.price_commercial.toFixed(2))
        .replace(/{{PRICE_EXTENDED}}/g, product.price_extended.toFixed(2))
        .replace(/{{FILENAME}}/g, product.filename || 'unknown')
        .replace(/{{KEYWORD}}/g, product.keyword || 'unknown')
        .replace(/{{IMAGE_URL}}/g, product.preview_url || '');
}

async function generatePages() {
    try {
        const template = fs.readFileSync(templatePath, 'utf8');
        const products = await fetchProducts();

        products.forEach(product => {
            const html = generateHtml(template, product);
            const safeFilename = (product.filename || 'product').replace(/[^\w-]/g, '_');
            const filePath = path.join(outputDir, `${safeFilename}.html`);
            fs.writeFileSync(filePath, html, 'utf8');
            console.log(`✅ Generated: ${filePath}`);
        });

        console.log('🎉 All product pages generated successfully!');
    } catch (err) {
        console.error('❌ Error generating product pages:', err);
    }
}

generatePages();
