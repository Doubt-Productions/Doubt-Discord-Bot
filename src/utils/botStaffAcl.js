const {
  BOT_STAFF_BADGE_ID,
} = require("../constants/botStaff");

/**
 * Whether a badge id or display name is reserved for global bot staff.
 */
function isReservedBotStaffBadge(badgeId, name) {
  if (badgeId === BOT_STAFF_BADGE_ID) {
    return true;
  }
  if (typeof name === "string" && name.trim().toLowerCase() === "bot staff") {
    return true;
  }
  return false;
}

/**
 * staffOnly gate: developers always pass; otherwise BotStaff membership.
 * @param {boolean} isBotStaffMember - result of Mongo BotStaff lookup
 */
function isStaffGateAllowed(userId, developerIds, isBotStaffMember) {
  if (Array.isArray(developerIds) && developerIds.includes(userId)) {
    return true;
  }
  return isBotStaffMember === true;
}

/**
 * Fail-closed staffOnly denial copy (no silent empty ACL after staffRoles removal).
 */
function getStaffOnlyDenialMessage({ hasAnyBotStaff }) {
  if (!hasAnyBotStaff) {
    return (
      "This is a staff-only command, but global bot staff is not configured yet. " +
      "A developer must run `/botstaff migrate` (while `moderation.staffRoles` is still in config) " +
      "or `/botstaff add` for each person before staff-only commands are available."
    );
  }

  return (
    "This command is restricted to global bot staff. " +
    "Ask a developer to add you with `/botstaff add`."
  );
}

module.exports = {
  isReservedBotStaffBadge,
  isStaffGateAllowed,
  getStaffOnlyDenialMessage,
};
