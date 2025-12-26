import { Telegraf } from "telegraf";
import { BotContext } from "..";
import * as db from "../../database";

function getEnvAdminIds(): number[] {
  if (!process.env.ADMIN_IDS) return [];
  try {
    const parsed = JSON.parse(process.env.ADMIN_IDS);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((id) => Number(id)).filter((id) => Number.isFinite(id));
  } catch {
    return [];
  }
}

export async function notifyAdmins(bot: Telegraf<BotContext>, message: string) {
  const adminIds = new Set<number>();
  for (const id of getEnvAdminIds()) adminIds.add(id);

  try {
    const dbAdmins = await db.getAdminIds();
    for (const id of dbAdmins) adminIds.add(id);
  } catch (error) {
    console.error(new Date().toString(), "Error loading admin IDs:", error);
  }

  for (const adminId of adminIds) {
    try {
      await bot.telegram.sendMessage(adminId, message);
    } catch (error) {
      console.error(
        new Date().toString(),
        `Could not notify admin ${adminId}:`,
        error
      );
    }
  }
}
