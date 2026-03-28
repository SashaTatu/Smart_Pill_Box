require('dotenv').config();
const { Bot, session } = require("grammy");
const { conversations, createConversation } = require("@grammyjs/conversations");
const mongoose = require("mongoose");
const http = require("http");

const { registrationConversation, addPillConversation } = require("./controllers/userController");
const setupRoutes = require("./routes/botRoutes");

const bot = new Bot(process.env.BOT_TOKEN);

// Налаштування сесій та розмов
bot.use(session({ initial: () => ({}) }));
bot.use(conversations());
bot.use(createConversation(registrationConversation));
bot.use(createConversation(addPillConversation));

// Підключення до БД
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ DB Error:", err));

// Шляхи
setupRoutes(bot);

// Запуск бота
bot.start().catch(err => console.error("Bot Error:", err));
console.log("🚀 Сервер та бот запущені...");

// HTTP сервер для підтримки активності на Render
http.createServer((req, res) => res.end("Bot is alive")).listen(process.env.PORT || 3000);