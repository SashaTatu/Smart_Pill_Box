require('dotenv').config();
const { Bot, session } = require("grammy");
const { conversations, createConversation } = require("@grammyjs/conversations");
const mongoose = require("mongoose");
const http = require("http");
const url = require("url"); // Додаємо для парсингу URL

const { registrationConversation, addPillConversation } = require("./controllers/userController");
const setupRoutes = require("./routes/botRoutes");

const bot = new Bot(process.env.BOT_TOKEN);

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());
bot.use(createConversation(registrationConversation));
bot.use(createConversation(addPillConversation));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ DB Error:", err));

setupRoutes(bot);

bot.start().catch(err => console.error("Bot Error:", err));

// --- НОВА ЧАСТИНА: Обробка прив'язки пристрою ---
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    // Ендпоінт для Web App, який отримав ID по Bluetooth
    if (req.method === "POST" && parsedUrl.pathname === "/api/bind-device") {
        let body = "";
        req.on("data", chunk => { body += chunk.toString(); });
        req.on("end", async () => {
            try {
                const { telegram_id, device_id } = JSON.parse(body);

                // 1. Тут ви можете викликати функцію для запису в Neo4j через ваш Python API
                // Або якщо Node.js має доступ до Neo4j, зробити запис прямо тут.
                
                console.log(`🔗 Прив'язка: Користувач ${telegram_id} -> Пристрій ${device_id}`);

                // 2. Надсилаємо повідомлення користувачу в бот про успіх
                await bot.api.sendMessage(telegram_id, `✅ Пристрій ${device_id} успішно підключено до вашого аккаунту!`);

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "ok" }));
            } catch (err) {
                res.writeHead(400);
                res.end("Invalid JSON");
            }
        });
    } else {
        res.end("Bot is alive");
    }
});

server.listen(process.env.PORT || 3000, () => {
    console.log("🚀 Сервер запущено, очікуємо на підключення пристроїв...");
});