require('dotenv').config();
const { Bot, session } = require("grammy");
const http = require("http");
const url = require("url");

const bot = new Bot(process.env.BOT_TOKEN);

// Використовуємо просту сесію
bot.use(session({ initial: () => ({}) }));

// Команда /start
bot.command("start", async (ctx) => {
    const userName = ctx.from?.first_name || "користувачу";
    await ctx.reply(`Вітаю, ${userName}! 👋\nНатисніть кнопку нижче, щоб налаштувати вашу таблетницю.`, {
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

// Функція для збору тіла POST-запиту
const getBatchData = (req) => {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", chunk => { body += chunk.toString(); });
        req.on("end", () => resolve(body));
        req.on("error", (err) => reject(err));
    });
};

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);

    // Налаштування CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Preflight запит від браузера
    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    // Простий пінг, щоб сервер не засинав
    if (req.method === "GET" && parsedUrl.pathname === "/ping") {
        res.writeHead(200);
        res.end("pong");
        return;
    }

    // Ендпоінт для реєстрації пристрою
    if (req.method === "POST" && parsedUrl.pathname === "/api/bind-device") {
        try {
            const body = await getBatchData(req);
            const { telegram_id, device_id } = JSON.parse(body);

            if (!telegram_id || !device_id) {
                throw new Error("Missing data");
            }

            console.log(`[BIND] Користувач: ${telegram_id} | Пристрій: ${device_id}`);

            // 1. Повідомлення користувачу
            await bot.api.sendMessage(telegram_id, 
                `✅ *Пристрій підключено!*\n\nІдентифікатор: \`${device_id}\`\nТепер ви можете додавати розклад ліків.`, 
                { parse_mode: "Markdown" }
            );

            // 2. Тут місце для запиту до Python/Neo4j сервера
            // axios.post('PYTHON_API_URL', { telegram_id, device_id })

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "ok", message: "Device bound successfully" }));

        } catch (e) {
            console.error("[SERVER ERROR]", e.message);
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "error", message: e.message }));
        }
    } else {
        res.writeHead(404);
        res.end("Not Found");
    }
});

// Запуск бота
bot.start({
    onStart: (botInfo) => {
        console.log(`🤖 Бот @${botInfo.username} запущено!`);
    },
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Сервер працює на порту ${PORT}`);
});











