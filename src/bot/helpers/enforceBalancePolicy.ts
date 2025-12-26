import { Telegraf } from "telegraf";
import { BotContext } from "..";
import { TUser } from "../../utils/user.type";
import * as db from "../../database";
import { i18n } from "../../locale";
import { kickUserFromGroup } from "./kickUserFromGroup";
import { consts } from "../../utils/consts";

const WARNING_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const MAX_WARNINGS = 3;

type EnforcementResult = "none" | "warned" | "kicked" | "cooldown";

function shouldWarn(lastWarnedAt: string | null, nowMs: number): boolean {
  if (!lastWarnedAt) return true;
  const lastWarnedMs = Date.parse(lastWarnedAt);
  if (Number.isNaN(lastWarnedMs)) return true;
  return nowMs - lastWarnedMs >= WARNING_COOLDOWN_MS;
}

export async function enforceBalancePolicy(
  bot: Telegraf<BotContext>,
  user: TUser,
  threshold: number,
  options?: { forceKick?: boolean }
): Promise<EnforcementResult> {
  const lang = consts.lang || "en";
  const balance = db.getTotalBalance(user);

  if (balance >= threshold) {
    if ((user.warn_count || 0) > 0 || user.last_warned_at) {
      await db.resetUserWarnings(user.telegram_id);
    }
    return "none";
  }

  if (options?.forceKick) {
    const kicked = await kickUserFromGroup(bot, user.telegram_id);
    if (kicked) {
      await db.markUserKicked(user.telegram_id);
      try {
        await bot.telegram.sendMessage(
          user.telegram_id,
          i18n(lang, "kickedDueToBalance")
        );
      } catch (notifyError) {
        console.error(
          new Date().toString(),
          `Could not notify user ${user.telegram_id}:`,
          notifyError
        );
      }
      return "kicked";
    }
    return "none";
  }

  const warnCount = user.warn_count || 0;
  const nowMs = Date.now();
  const canWarn = shouldWarn(user.last_warned_at, nowMs);

  if (warnCount >= MAX_WARNINGS) {
    if (!canWarn) return "cooldown";
    const kicked = await kickUserFromGroup(bot, user.telegram_id);
    if (kicked) {
      await db.markUserKicked(user.telegram_id);
      try {
        await bot.telegram.sendMessage(
          user.telegram_id,
          i18n(lang, "kickedDueToBalance")
        );
      } catch (notifyError) {
        console.error(
          new Date().toString(),
          `Could not notify user ${user.telegram_id}:`,
          notifyError
        );
      }
      return "kicked";
    }
    return "none";
  }

  if (!canWarn) return "cooldown";

  const warningDay = warnCount + 1;
  await db.markUserWarned(user.telegram_id);
  try {
    await bot.telegram.sendMessage(
      user.telegram_id,
      i18n(lang, "warningBelowThreshold", warningDay, threshold, balance)
    );
  } catch (notifyError) {
    console.error(
      new Date().toString(),
      `Could not notify user ${user.telegram_id}:`,
      notifyError
    );
  }
  return "warned";
}
