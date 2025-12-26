import { Telegraf } from "telegraf";
import { BotContext } from "..";
import * as db from "../../database";
import { kickUserFromGroup } from "../helpers/kickUserFromGroup";
import { enforceBalancePolicy } from "../helpers/enforceBalancePolicy";

export async function newMemberHandler(
  ctx: BotContext,
  bot: Telegraf<BotContext>
) {
  if (!ctx.chat || !ctx.message || !("new_chat_members" in ctx.message)) return;
  if (ctx.chat.id.toString() !== process.env.GROUP_ID) return;

  for (const member of ctx.message.new_chat_members) {
    try {
      // Find user in database
      const user = await db.getUserByTelegramId(member.id);

      if (!user || !user.uid) {
        // Unregistered user - kick
        await kickUserFromGroup(bot, member.id);
        continue;
      }

      // Check balance against threshold
      const threshold = await db.getThreshold();
      if (db.getTotalBalance(user) < threshold) {
        // Below threshold - allow join, warn before kicking
        await db.markUserJoined(member.id);
        await enforceBalancePolicy(bot, user, threshold);
      } else {
        // Valid join - mark as joined and clear warning state
        await db.markUserJoined(member.id);
        await db.resetUserWarnings(member.id);
      }
    } catch (error) {
      console.error(
        new Date().toString(),
        `Error processing new member ${member.id}:`,
        error
      );
    }
  }
}
