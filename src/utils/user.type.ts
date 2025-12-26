export type TUser = {
  id: number;
  telegram_id: number;
  uid: string;
  username: string;
  name: string;
  spot_balance: number;
  contract_balance: number;
  joined: boolean;
  joined_at: string | null;
  kicked_at: string | null;
  warn_count: number;
  last_warned_at: string | null;
  is_admin: boolean;
  language_code: "fa" | "en";
};
