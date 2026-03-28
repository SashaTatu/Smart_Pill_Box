const { InlineKeyboard } = require("grammy");
const User = require("../models/User");

// Сценарій реєстрації пристрою
async function registrationConversation(conversation, ctx) {
    await ctx.reply(
        "👋 **Вітаю у Smart Pill Box!**\n\n" +
        "Для початку синхронізуємо ваш пристрій:\n" +
        "1️⃣ Увімкніть ваш Smart Pill Box.\n" +
        "2️⃣ Підключіться до Wi-Fi мережі пристрою.\n" +
        "3️⃣ Отримайте ваш унікальний **Device ID**.\n"
    );

    await ctx.reply("✍️ Введіть ваш **Device ID** (наприклад, MAC-адресу):");

    const { message } = await conversation.wait();
    const inputId = message.text.trim();

    try {
        await conversation.external(() => 
            User.findOneAndUpdate(
                { chatId: ctx.from.id },
                { deviceID: inputId, firstName: ctx.from.first_name },
                { upsert: true }
            )
        );
        await ctx.reply(`✅ Пристрій [${inputId}] успішно прив'язано!`, {
            reply_markup: new InlineKeyboard().text("➕ Додати перші ліки", "add_pill")
        });
    } catch (err) {
        await ctx.reply("❌ Помилка: цей ID вже використовується іншим користувачем.");
    }
}

// Сценарій додавання ліків
async function addPillConversation(conversation, ctx) {
    await ctx.reply("Введіть назву ліків:");
    const nameMsg = await conversation.wait();
    const pillName = nameMsg.message.text;

    await ctx.reply("Введіть час прийому (наприклад, 08:30):");
    const timeMsg = await conversation.wait();
    const pillTime = timeMsg.message.text;

    try {
        await conversation.external(() =>
            User.updateOne(
                { chatId: ctx.from.id },
                { $push: { pills: { name: pillName, time: pillTime } } }
            )
        );
        await ctx.reply(`💊 ${pillName} додано у розклад на ${pillTime}!`);
    } catch (err) {
        await ctx.reply("❌ Не вдалося зберегти дані.");
    }
}

module.exports = { registrationConversation, addPillConversation };