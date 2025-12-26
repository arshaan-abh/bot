import { Telegraf } from "telegraf";
import { BotContext } from "..";
import { consts } from "../../utils/consts";
import { i18n } from "../../locale";
import { notifyAdmins } from "../helpers/notifyAdmins";

const DEACTIVATED_STATUSES = new Set(["kicked", "left", "restricted"]);

export async function botStatusHandler(
  ctx: BotContext,
  bot: Telegraf<BotContext>
) {
  if (!("my_chat_member" in ctx.update)) return;
  const update = ctx.update.my_chat_member;
  if (update.chat.id.toString() !== process.env.GROUP_ID) return;

  const status = update.new_chat_member.status;
  if (!DEACTIVATED_STATUSES.has(status)) return;

  const lang = consts.lang || "en";
  await notifyAdmins(bot, i18n(lang, "botDeactivatedWarning"));
}
