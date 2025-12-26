export const messages_en = {
  greeting: `
🌟  Welcome to Our Exclusive Community  🌟

This bot verifies access to our private network.

Let's begin your onboarding process. 🚀
  `,

  askUid: `
🆔  Identity Verification Required  🆔

Please provide your UID to authenticate and proceed:

▸ This ensures secure access to our platform 🔒
  `,

  notAllowed: `
🚫  Authorization Required  🚫

Your credentials don't currently grant access to this private group.

Please contact support if you believe this is an error. 📩
  `,

  belowThreshold: `
💸  Account Requirements Not Met  💸

Your current balance is below the minimum threshold for access.

Required: {0} | Your Balance: {1}
  `,

  warningBelowThreshold: `
??  Balance Warning (Day {0}/3)  ??

Your balance is below the minimum threshold.

Required: {1} | Your Balance: {2}

Please top up within 3 days to avoid removal.
  `,

  botDeactivatedWarning: `
??  Bot Deactivated  ??

The bot was removed or disabled in the group.

No new members will be processed until it is re-added.
  `,

  noUserJoinsWarning: `
??  No New Joins  ??

No users have joined in the last {0} hours.

Please check if the bot is active and the invite flow is working.
  `,

  inviteSent: `
🎉  Access Granted Successfully!  🎉

Verification complete! Your private invitation link:

🔗 {0}

⚠️ This link expires in 24 hours
  `,

  alreadyJoined: `
🤝  Membership Verified  🤝

Our records show you're already an active member.

Enjoy your privileges! 🎁
  `,

  uidNotFound: `
❓  Verification Failed  ❓

The provided UID wasn't found in our system.

▸ Check for typos
▸ Contact support if issues persist 📞
  `,

  uidSaved: `
🔏  Identity Secured  🔏

Your UID has been successfully registered to your account.

Thank you for your cooperation! 🤝
  `,

  adminOnly: `
👨‍💼  Administrative Privileges Required  👨‍💼

This function is restricted to authorized personnel only.

Unauthorized access is prohibited. 🚨
  `,
  supportSet: `
👨‍💼  system Support id updated  👨‍💼

Support id is set to {0} 

Effective immediately. ⏱️
  `,

  thresholdSet: `
📈  System Threshold Updated  📈

Minimum balance requirement has been set to:

▸ {0}

Effective immediately. ⏱️
  `,

  currentThreshold: `
🏷️  Current System Requirements  🏷️

Minimum balance for access:

▸ {0}

Maintain this balance to keep access. 💰
  `,

  adminAdded: `
⭐  New Administrator Added  ⭐

User {0} has been granted management privileges.

All permissions activated. 🚀
  `,

  invalidSupport: `
📛  Invalid Configuration  📛

Please enter a valid username for the support.

it should be like @username. 🔢
  `,
  invalidThreshold: `
📛  Invalid Configuration  📛

Please enter a valid numerical value for the threshold.

Only numbers are accepted. 🔢
  `,

  invalidUid: `
🆔  Verification Error  🆔

The UID format appears invalid.

▸ Check the format
▸ Resubmit with correct details 📝
  `,

  kickedDueToBalance: `
📉  Membership Paused  📉

Your access has been temporarily restricted.

Reason: Balance fell below required threshold.

Replenish to regain access. 💳
  `,

  error: `
⚠️━━━━━━━━━━━━━━━━━━━━━━━━━━━⚠️
⚡  System Notification  ⚡
⚠️━━━━━━━━━━━━━━━━━━━━━━━━━━━⚠️

We're experiencing technical difficulties.

▸ Please try again later
▸ Contact support if persistent 🛠️
  `,

  cannotChangeUid: `
🚷  Permanent Record  🚷

UID assignments cannot be modified after registration.

This is a security measure. 🛡️
  `,

  uidAlreadyUsed: `
⚔️  Conflict Detected  ⚔️

This UID is already associated with another account.

Each UID must be unique. ✨
  `,

  uidDoesntExist: `
❓  Record Not Found  ❓

The provided UID doesn't exist in our registry.

▸ Verify your UID
▸ Contact registration support 📋
  `,

  editWelcome: `
📝  Welcome Message Configuration  📝

Please submit the new greeting message:

  `,

  editSuccess: `
🔄  Update Confirmed  🔄

The welcome message has been successfully updated.

Changes take effect immediately. ⚡
  `,

  askContact: `
📇  Contact Verification  📇

For enhanced security, please share your contact information:

This helps prevent unauthorized access. 🛡️
  `,

  shareContact: "📲 Share Contact Details",
  support: "👨‍💼 Support",
  supportMessage: `
👨‍💼  Support  👨‍💼

if you have a problem contact {0}
  `,

  help: `
🆘  Account Management Portal  🆘

▸ /start - Initiate verification
▸ /setthreshold <amount> - Configure access requirements
▸ /threshold - View current minimum balance
▸ /addadmin <ID> - Grant administrative rights
▸ /forcekick - Enforce balance requirements
▸ /stats - View system analytics
▸ /editWelcome - Customize greeting message
▸ /setsupport <@username> - change support

Need assistance? Contact our support team! 💬
  `,
};

export const messages_fa: Record<keyof typeof messages_en, string> = {
  greeting: `
🌟  به جامعه اختصاصی ما خوش آمدید  🌟

این ربات دسترسی به شبکه خصوصی ما را تأیید می‌کند.

لطفاً فرآیند عضویت را آغاز کنید. 🚀
  `,

  askUid: `
🆔  نیاز به تأیید هویت  🆔

لطفاً UID خود را برای احراز هویت ارائه دهید:

▸ این فرآیند امنیت دسترسی را تضمین می‌کند 🔒
  `,

  notAllowed: `
🚫  دسترسی محدود  🚫

اعتبار شما در حال حاضر اجازه دسترسی به این گروه خصوصی را نمی‌دهد.

در صورت اشتباه بودن این پیام با پشتیبانی تماس بگیرید. 📩
  `,

  belowThreshold: `
💸  شرایط حساب تکمیل نشده  💸

موجودی شما کمتر از حداقل لازم برای دسترسی است.

مقدار مورد نیاز: {0} | موجودی شما: {1}
  `,

  warningBelowThreshold: `
??  ????? ???? (??? {0}/3)  ??

?????? ??? ???? ?? ????? ???? ???? ?????? ???.

????? ???? ????: {1} | ?????? ???: {2}

????? ??? 3 ??? ????? ??? ?? ??? ?? ??? ????.
  `,

  botDeactivatedWarning: `
??  ربات غیرفعال شد  ??

ربات از گروه حذف شده یا غیرفعال شده است.

تا زمانی که دوباره اضافه نشود، اعضای جدید پردازش نمی‌شوند.
  `,

  noUserJoinsWarning: `
??  عدم عضویت جدید  ??

در {0} ساعت گذشته هیچ عضوی وارد نشده است.

لطفا فعال بودن ربات و روند دعوت را بررسی کنید.
  `,

  inviteSent: `
🎉  دسترسی تأیید شد!  🎉

احراز هویت با موفقیت انجام شد! لینک دعوت خصوصی شما:

🔗 {0}

⚠️ این لینک پس از ۲۴ ساعت منقضی می‌شود
  `,

  alreadyJoined: `
🤝  عضویت تأیید شد  🤝

شما قبلاً عضو این گروه هستید.

از امکانات ویژه خود لذت ببرید! 🎁
  `,

  uidNotFound: `
❓  تأیید هویت ناموفق  ❓

شناسه(UID) ارائه شده در سیستم یافت نشد.

▸ از صحت UID اطمینان حاصل کنید
▸ در صورت تکرار با پشتیبانی تماس بگیرید 📞
  `,

  uidSaved: `
🔏  هویت تأیید شد  🔏

شناسه(UID) شما با موفقیت ثبت گردید.

از همکاری شما متشکریم! 🤝
  `,

  adminOnly: `
👨‍💼  نیاز به دسترسی مدیریتی  👨‍💼

این عملکرد فقط برای پرسنل مجاز قابل استفاده است.

دسترسی غیرمجاز ممنوع می‌باشد. 🚨
  `,

  thresholdSet: `
📈  آستانه سیستم به‌روزرسانی شد  📈

حداقل موجودی مورد نیاز تنظیم شد به:

▸ {0}

این تغییر بلافاصله اعمال می‌شود. ⏱️
  `,

  currentThreshold: `
🏷️  شرایط فعلی سیستم  🏷️

حداقل موجودی لازم برای دسترسی:

▸ {0}

برای حفظ دسترسی، این موجودی را حفظ کنید. 💰
  `,

  adminAdded: `
⭐  مدیر جدید اضافه شد  ⭐

کاربر {0} به عنوان مدیر تعیین گردید.

تمام دسترسی‌ها فعال شد. 🚀
  `,

  invalidThreshold: `
📛  مقدار نامعتبر  📛

لطفاً یک عدد معتبر برای حداقل موجودی وارد کنید.

فقط اعداد قابل قبول هستند. 🔢
  `,

  invalidUid: `
🆔  خطای تأیید  🆔

فرمت UID نامعتبر است.

▸ فرمت را بررسی کنید
▸ با اطلاعات صحیح مجدداً ارسال کنید 📝
  `,

  kickedDueToBalance: `
📉  دسترسی موقتاً محدود شد  📉

دسترسی شما موقتاً مسدود شده است.

دلیل: موجودی کمتر از حداقل مورد نیاز.

موجودی خود را افزایش دهید. 💳
  `,

  error: `
⚡  خطای سیستم  ⚡

در حال حاضر مشکل فنی وجود دارد.

▸ لطفاً بعداً تلاش کنید
▸ در صورت تداوم با پشتیبانی تماس بگیرید 🛠️
  `,

  cannotChangeUid: `
🚷  ثبت دائمی  🚷

شناسه(UID) پس از ثبت قابل تغییر نیست.

این یک اقدام امنیتی است. 🛡️
  `,

  uidAlreadyUsed: `
⚔️  شناسه تکراری  ⚔️

این UID قبلاً به حساب دیگری متصل شده است.

هر UID باید منحصر به فرد باشد. ✨
  `,

  uidDoesntExist: `
❓  رکورد یافت نشد  ❓

شناسه(UID) ارائه شده در سیستم وجود ندارد.

▸ شناسه(UID) خود را بررسی کنید
▸ با پشتیبانی ثبت نام تماس بگیرید 📋
  `,

  editWelcome: `
📝  تنظیم پیام خوشامد  📝

لطفاً پیام خوشامد جدید را ارسال کنید:

  `,

  editSuccess: `
🔄  به‌روزرسانی تأیید شد  🔄

پیام خوشامد با موفقیت به‌روزرسانی شد.

تغییرات بلافاصله اعمال می‌شوند. ⚡
  `,

  askContact: `
📇  تأیید تماس  📇

برای امنیت بیشتر، لطفاً اطلاعات تماس خود را به اشتراک بگذارید:

این کار از دسترسی غیرمجاز جلوگیری می‌کند. 🛡️
  `,

  shareContact: "📲 اشتراک اطلاعات تماس",
  support: "👨‍💼 پشتیبانی",
  supportMessage: `
👨‍💼  پشتیبانی  👨‍💼

اگر مشکلی داشتید پشتیبانی ما در خدمت شماست 

{0}
  `,
  supportSet: `
👨‍💼  آیدی پشتیبانی آپدیت شد  👨‍💼

آیدی پشتیبانی از این به بعد {0} است.

تغییرات بلافاصله اعمال می‌شوند. ⚡
  `,
  invalidSupport: `
📛  آیدی غلط  📛

لطفا یک آیدی درست استفاده کنید.

  `,

  help: `
🆘  پنل مدیریت حساب  🆘

▸ /start - شروع فرآیند تأیید
▸ /setthreshold <مقدار> - تنظیم نیازمندی‌های دسترسی
▸ /threshold - مشاهده حداقل موجودی فعلی
▸ /addadmin <ID> - اعطای دسترسی مدیریت
▸ /forcekick - اعمال نیازمندی‌های موجودی
▸ /stats - مشاهده آمار سیستم
▸ /editWelcome - سفارشی‌سازی پیام خوشامد
▸ /setsupport <@username> - تغییر پشتیبانی

نیاز به کمک دارید؟ با پشتیبانی تماس بگیرید! 💬
  `,
};
