import * as db from "./database";
import { Telegraf } from "telegraf";
import { enforceBalancePolicy } from "./bot/helpers/enforceBalancePolicy";
import { notifyAdmins } from "./bot/helpers/notifyAdmins";
import { i18n } from "./locale";
import { getTeamList } from "./services/getTeamList";
import { consts } from "./utils/consts";

const DEFAULT_NO_JOIN_WARNING_HOURS = 24;
const BOT_STARTED_AT_MS = Date.now();
let lastNoJoinWarningAtMs: number | null = null;

function getNoJoinWarningHours(): number {
  const raw = process.env.NO_JOIN_WARNING_HOURS;
  const parsed = raw ? Number(raw) : DEFAULT_NO_JOIN_WARNING_HOURS;
  if (!Number.isFinite(parsed) || parsed <= 0)
    return DEFAULT_NO_JOIN_WARNING_HOURS;
  return parsed;
}

async function warnIfNoJoins(bot: Telegraf<any>) {
  const hours = getNoJoinWarningHours();
  const windowMs = hours * 60 * 60 * 1000;
  const lastJoinedAt = await db.getLastJoinedAt();
  const nowMs = Date.now();
  let lastJoinMs = BOT_STARTED_AT_MS;

  if (lastJoinedAt) {
    const parsed = Date.parse(lastJoinedAt);
    if (Number.isFinite(parsed)) {
      lastJoinMs = parsed;
    }
  }

  if (nowMs - lastJoinMs < windowMs) return;
  if (lastNoJoinWarningAtMs && nowMs - lastNoJoinWarningAtMs < windowMs) return;

  const lang = consts.lang || "en";
  await notifyAdmins(bot, i18n(lang, "noUserJoinsWarning", hours));
  lastNoJoinWarningAtMs = nowMs;
}

// Sync balances from API
export async function syncBalances(bot: Telegraf<any>) {
  try {
    console.log(new Date().toString(), "Syncing balances...");

    // let response = { data: [] as TGetTeamListRes[] };
    let i = 0;
    try {
      while (true) {
        const res = await getTeamList(i).then((res) => {
          if (res?.data && res.data.length > 0) {
            return res;
          } else {
            console.log(new Date().toString(), "No data returned", i);
            return { data: [] };
          }
        });

        // Update balances for all users
        for (const balance of res.data) {
          try {
            // Update user balances
            await db.updateUserBalances(
              balance.openId,
              Number(balance.currencyTotalFeeAmt),
              Number(balance.contractTotalFeeAmt)
            );
          } catch (error) {
            console.error(
              new Date().toString(),
              `Error updating balance for UID ${balance.openId}:`,
              error
            );
          }
        }
        i = i + 100;
        if (res.data.length < 100) break;
        if (i > 10000) break;
      }
    } catch (e) {
      console.log(new Date().toString(), e);
      i = 100000;
    }

    // Check if any joined users are now below threshold
    const users = await db.getJoinedUsers();
    const threshold = await db.getThreshold();

    for (const user of users) {
      try {
        // Get fresh user data with updated balances
        const updatedUser = await db.getUserByTelegramId(user.telegram_id);

        if (!updatedUser) continue;

        const result = await enforceBalancePolicy(bot, updatedUser, threshold);
        if (result === "kicked") {
          console.log(
            new Date().toString(),
            `User ${user.telegram_id} removed after warning window.`
          );
        }
      } catch (userError) {
        console.error(
          new Date().toString(),
          `Error checking user ${user.telegram_id}:`,
          userError
        );
      }
    }

    await warnIfNoJoins(bot);

    console.log(new Date().toString(), "Balance sync completed");
  } catch (error) {
    console.error(new Date().toString(), "Error syncing balances:", error);
  }
}

// Setup periodic balance syncing
export function setupBalanceSync(bot: Telegraf<any>) {
  // Schedule periodic sync using setInterval
  const interval =
    parseInt(process.env.SYNC_INTERVAL_MINUTES || "30", 10) * 60 * 1000;

  setInterval(() => {
    syncBalances(bot).catch((err) =>
      console.error(
        new Date().toString(),
        "Error in scheduled balance sync:",
        err
      )
    );
  }, interval);

  // Run initial sync
  syncBalances(bot).catch((err) =>
    console.error(new Date().toString(), "Error in initial balance sync:", err)
  );

  console.log(
    new Date().toString(),
    `Balance sync scheduled every ${interval / 60000} minutes`
  );
}
