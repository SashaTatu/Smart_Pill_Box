require('dotenv').config();
const { Bot, session } = require("grammy");
const { conversations, createConversation } = require("@grammyjs/conversations");
const mongoose = require("mongoose");
const http = require("http");
const url = require("url");

const bot = new Bot(process.env.BOT_TOKEN);

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

// Команда Старт з кнопкою Web App
bot.command("start", async (ctx) => {
    await ctx.reply("Вітаю! Натисніть кнопку нижче, щоб підключити вашу таблетницю через Bluetooth.", {
        reply_markup: {
            inline_keyboard: [[
                { 
                    text: "🔗 Підключити пристрій", 
                    web_app: { url: "https://your-github-io-link.com" } // Твій сайт з п.3
                }
            ]]
        }
    });
});

// HTTP Сервер для прийому даних від Web App
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (req.method === "POST" && parsedUrl.pathname === "/api/bind-device") {
        let body = "";
        req.on("data", chunk => { body += chunk.toString(); });
        req.on("end", async () => {
            const { telegram_id, device_id } = JSON.parse(body);
            
            // ТУТ ПЕРЕДАЙ ДАНІ РОЗРОБНИКУ PYTHON ДЛЯ NEO4J
            console.log(`User ${telegram_id} linked to ${device_id}`);

            await bot.api.sendMessage(telegram_id, `✅ Пристрій ${device_id} успішно прив'язано!`);
            
            res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
            res.end(JSON.stringify({ status: "ok" }));
        });
    } else {
        res.end("Alive");
    }
});

mongoose.connect(process.env.MONGO_URI).then(() => console.log("✅ MongoDB Connected"));
bot.start();
server.listen(process.env.PORT || 3000);