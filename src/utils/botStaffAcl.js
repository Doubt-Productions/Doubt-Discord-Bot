const {
  BOT_STAFF_BADGE_ID,
} = require("../constants/botStaff");

const RESERVED_BOT_STAFF_BADGE_KEY = "botstaff";

function normalizeBadgeKey(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/**
 * Whether a badge id or display name is reserved for global bot staff.
 */
function isReservedBotStaffBadge(badgeId, name) {
  if (badgeId === BOT_STAFF_BADGE_ID) {
    return true;
  }

  const keys = [normalizeBadgeKey(badgeId), normalizeBadgeKey(name)];
  return keys.some((key) => key === RESERVED_BOT_STAFF_BADGE_KEY);
}

/**
 * staffOnly commands that are not also developer commands use the BotStaff ACL only.
 */
function usesStaffOnlyGate(commandObject) {
  return (
    commandObject?.options?.staffOnly === true &&
    commandObject?.options?.developers !== true
  );
}

/**
 * Developer commands (including devOnly/ defaults without staffOnly) require developers.
 */
function requiresDeveloperGate(commandObject) {
  return !usesStaffOnlyGate(commandObject);
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
  normalizeBadgeKey,
  isReservedBotStaffBadge,
  usesStaffOnlyGate,
  requiresDeveloperGate,
  isStaffGateAllowed,
  getStaffOnlyDenialMessage,
};
