import { consts } from "../../utils/consts";
import { Telegraf } from "telegraf";
import { BotContext } from "..";
import * as db from "../../database";
import { i18n } from "../../locale";
import { isAdmin } from "../helpers/isAdmin";
import { enforceBalancePolicy } from "../helpers/enforceBalancePolicy";

export async function forceKickHandler(
  ctx: BotContext,
  bot: Telegraf<BotContext>
) {
  if (!ctx.chat) return;
  if (ctx.chat.type !== "private") return; // Skip if not a private chat

  const lang = consts.lang;

  if (!isAdmin(ctx)) {
    await ctx.reply(i18n(lang, "adminOnly"));
    return;
  }

  await ctx.reply("Starting force kick process...");

  const users = await db.getJoinedUsers();
  const threshold = await db.getThreshold();
  let kickedCount = 0;

  for (const user of users) {
    if (db.getTotalBalance(user) < threshold) {
      try {
        const result = await enforceBalancePolicy(bot, user, threshold, {
          forceKick: true,
        });
        if (result === "kicked") {
          kickedCount++;
        }
      } catch (kickError) {
        console.error(
          new Date().toString(),
          `Error kicking user ${user.telegram_id}:`,
          kickError
        );
      }
    }
  }

  await ctx.reply(`Force kick completed. ${kickedCount} users were removed.`);
}
