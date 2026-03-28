require('dotenv').config();
const { Bot } = require("grammy");
const mongoose = require("mongoose");
const http = require("http");

// Підключення до MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ База даних успішно підключена"))
    .catch(err => {
        console.error("❌ Помилка підключення до БД:", err.message);
        process.exit(1); // Зупиняємо процес, якщо БД не доступна
    });

// Ініціалізація бота
const bot = new Bot(process.env.BOT_TOKEN);

// Обробник команди /start
bot.command("start", async (ctx) => {
    await ctx.reply("Привіт! Я - твій розумний бокс для ліків. Я допоможу тобі не забувати приймати ліки вчасно. Використовуй команди, щоб налаштувати нагадування та керувати своїми ліками.");
});

// Запуск бота
bot.start();
console.log("🚀 Бот запущений...");

// Створення HTTP сервера для моніторингу стану
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Smart Pill Box Server is running');
});
// Запуск сервера
server.listen(PORT, () => {
    console.log(`🌐 Сервер слухає порт ${PORT}`);
});