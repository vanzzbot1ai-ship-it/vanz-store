const express = require('express');
const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');

// --- CONFIG UTAMA ---
const BOT_TOKEN = '7715360708:AAER46442IsUV7S5JS5cWAbDh8_go6F3fio'; 
const WA_NUMBER = '62895365156485'; // Nomor WhatsApp toko kamu tanpa spasi / +
const TG_ADMIN_USERNAME = 'VanzzBan'; // Username Telegram tanpa @

const app = express();
const bot = new Telegraf(BOT_TOKEN);
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'products.json');

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]');
}

app.use(express.json());

// API untuk mengambil data produk ke halaman web
app.get('/api/products', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '[]');
    res.json(data);
});

// Load file utama web
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Membaca file foto profil secara aman jika diakses dari web browser
app.get('/vanz.jpg', (req, res) => {
    res.sendFile(path.join(__dirname, 'vanz.jpg'));
});

// Perintah Bot Telegram
bot.command('addproduct', (ctx) => {
    const rawText = ctx.message.text.replace('/addproduct', '').trim();
    
    if (!rawText) {
        return ctx.reply("❌ Gagal! Harap masukkan format teks price list setelah command.");
    }

    try {
        const currentData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '[]');
        
        const newProduct = {
            id: Date.now(),
            text: rawText,
            wa: WA_NUMBER,
            tg: TG_ADMIN_USERNAME
        };
        
        currentData.unshift(newProduct);
        fs.writeFileSync(DATA_FILE, JSON.stringify(currentData, null, 2));
        
        ctx.reply("✅ BERHASIL! Produk langsung nampil di web lengkap dengan tombol WhatsApp & Telegram.");
    } catch (error) {
        console.error(error);
        ctx.reply("❌ Gagal menyimpan data produk ke database internal.");
    }
});

bot.launch().then(() => console.log('⚡ Bot Telegram Toko Aktif'));
app.listen(PORT, () => console.log(`🌐 Server Vanzz Store Berjalan Di Port: ${PORT}`));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
