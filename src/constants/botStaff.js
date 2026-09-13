/** Reserved bot-staff badge (display-only; privilege comes from BotStaff collection). */
const BOT_STAFF_BADGE_ID = "bot-staff";
const BOT_STAFF_BADGE_NAME = "Bot Staff";
const BOT_STAFF_BADGE_EMOJI = "🛡️";

/** Shown after `/botstaff migrate` — explains force re-import behavior. */
const BOT_STAFF_MIGRATE_WARNING =
  "Migrate is one-time when BotStaff is empty. Use force only to re-import legacy roles; removed users and bots are always skipped. " +
  "After cutover, remove legacy Discord staff roles.";

/** Fail-closed copy when the staff gate cannot be evaluated. */
const STAFF_GATE_ERROR_MESSAGE =
  "Could not verify staff access. Please try again later.";

module.exports = {
  BOT_STAFF_BADGE_ID,
  BOT_STAFF_BADGE_NAME,
  BOT_STAFF_BADGE_EMOJI,
  BOT_STAFF_MIGRATE_WARNING,
  STAFF_GATE_ERROR_MESSAGE,
};
