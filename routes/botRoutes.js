const User = require("../models/User");

module.exports = (bot) => {
    bot.command("start", async (ctx) => {
        const user = await User.findOne({ chatId: ctx.from.id });
        
        if (!user || !user.deviceID) {
            return await ctx.conversation.enter("registrationConversation");
        }

        await ctx.reply(`Привіт, ${user.firstName}! Ваша аптечка підключена.`, {
            reply_markup: {
                inline_keyboard: [[{ text: "➕ Додати ліки", callback_data: "add_pill" }]]
            }
        });
    });

    bot.callbackQuery("add_pill", async (ctx) => {
        await ctx.answerCallbackQuery();
        await ctx.conversation.enter("addPillConversation");
    });
};