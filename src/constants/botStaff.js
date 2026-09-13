/** Reserved bot-staff badge (display-only; privilege comes from BotStaff collection). */
const BOT_STAFF_BADGE_ID = "bot-staff";
const BOT_STAFF_BADGE_NAME = "Bot Staff";
const BOT_STAFF_BADGE_EMOJI = "🛡️";

/** Shown after `/botstaff migrate` — re-runs can undo intentional removals. */
const BOT_STAFF_MIGRATE_WARNING =
  "Migration re-adds anyone who still holds a legacy Discord staff role, even if they were previously removed with `/botstaff remove`. " +
  "After cutover, remove those Discord roles and do not re-run migrate unless you intend to re-import.";

module.exports = {
  BOT_STAFF_BADGE_ID,
  BOT_STAFF_BADGE_NAME,
  BOT_STAFF_BADGE_EMOJI,
  BOT_STAFF_MIGRATE_WARNING,
};
