/**
 * Regression: dev-only folder commands set `options.developers: true` (not `devOnly`).
 * staffOnly commands without options.developers use the BotStaff ACL only.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const {
  normalizeIdAllowlist,
} = require("../src/utils/normalizeIdAllowlist");
const {
  isStaffGateAllowed,
  usesStaffOnlyGate,
  requiresDeveloperGate,
} = require("../src/utils/botStaffAcl");

const DEVELOPER_ID = "111111111111111111";
const BOT_STAFF_ID = "222222222222222222";
const RANDOM_ID = "333333333333333333";
const developerIds = normalizeIdAllowlist([DEVELOPER_ID]);

function devCommandAllowed(userId, commandObject, isBotStaffMember) {
  if (usesStaffOnlyGate(commandObject)) {
    return isStaffGateAllowed(userId, developerIds, isBotStaffMember);
  }
  if (requiresDeveloperGate(commandObject)) {
    return developerIds.includes(userId);
  }
  return true;
}

test("staffOnly commands without developers use BotStaff gate only", () => {
  const staffCmd = { options: { staffOnly: true } };
  assert.strictEqual(usesStaffOnlyGate(staffCmd), true);
  assert.strictEqual(requiresDeveloperGate(staffCmd), false);
});

test("developer commands still require developer gate", () => {
  const botstaffCmd = { options: { developers: true } };
  const evalCmd = { options: { developers: true } };
  assert.strictEqual(usesStaffOnlyGate(botstaffCmd), false);
  assert.strictEqual(requiresDeveloperGate(botstaffCmd), true);
  assert.strictEqual(requiresDeveloperGate(evalCmd), true);
  assert.strictEqual(requiresDeveloperGate({ options: {} }), true);
});

test("staffOnly plus developers uses developer gate path", () => {
  const both = { options: { staffOnly: true, developers: true } };
  assert.strictEqual(usesStaffOnlyGate(both), false);
  assert.strictEqual(requiresDeveloperGate(both), true);
});

test("BotStaff member can run staffOnly command without being a developer", () => {
  const staffCmd = { options: { staffOnly: true } };
  const allowed = devCommandAllowed(BOT_STAFF_ID, staffCmd, true);
  assert.strictEqual(allowed, true);
});

test("non-staff non-developer cannot run staffOnly command", () => {
  const staffCmd = { options: { staffOnly: true } };
  const allowed = devCommandAllowed(RANDOM_ID, staffCmd, false);
  assert.strictEqual(allowed, false);
});

test("developer can run staffOnly command even when not in BotStaff", () => {
  const staffCmd = { options: { staffOnly: true } };
  const allowed = devCommandAllowed(DEVELOPER_ID, staffCmd, false);
  assert.strictEqual(allowed, true);
});

test("/botstaff rejects non-developers even if they are BotStaff", () => {
  const botstaffCmd = { options: { developers: true } };
  const allowed = devCommandAllowed(BOT_STAFF_ID, botstaffCmd, true);
  assert.strictEqual(allowed, false);
});

test("developer can run /botstaff", () => {
  const botstaffCmd = { options: { developers: true } };
  const allowed = devCommandAllowed(DEVELOPER_ID, botstaffCmd, false);
  assert.strictEqual(allowed, true);
});
