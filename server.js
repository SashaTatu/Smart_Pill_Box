require('dotenv').config();
const { Bot, session } = require("grammy");
const http = require("http");
const url = require("url");

const bot = new Bot(process.env.BOT_TOKEN);
bot.use(session({ initial: () => ({}) }));

// Кнопка для запуску Web App
bot.command("start", async (ctx) => {
    await ctx.reply("Вітаю! Натисніть кнопку нижче, щоб налаштувати Wi-Fi та підключити таблетницю.", {
        reply_markup: {
            inline_keyboard: [[
                { 
                    text: "⚙️ Налаштувати пристрій", 
                    web_app: { url: "https://sashatatu.github.io/Smart_pill_box_pages/" } 
                }
            ]]
        }
    });
});

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    // Додаємо CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204); res.end(); return;
    }

    if (req.method === "POST" && parsedUrl.pathname === "/api/bind-device") {
        let body = "";
        req.on("data", chunk => { body += chunk.toString(); });
        req.on("end", async () => {
            try {
                const { telegram_id, device_id } = JSON.parse(body);
                console.log(`🔗 Зв'язок: Користувач ${telegram_id} -> Пристрій ${device_id}`);

                // Тут ви можете зробити запит до вашого Python/Neo4j сервера
                
                await bot.api.sendMessage(telegram_id, `✅ Пристрій ${device_id} успішно зареєстровано!`);
                
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "ok" }));
            } catch (e) {
                res.writeHead(400); res.end("Error");
            }
        });
    } else {
        res.end("Bot is running");
    }
});

bot.start();
server.listen(process.env.PORT || 3000);












