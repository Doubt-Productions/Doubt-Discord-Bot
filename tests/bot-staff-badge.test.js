const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { isReservedBotStaffBadge } = require("../src/utils/botStaffAcl");
const {
  BOT_STAFF_BADGE_ID,
  BOT_STAFF_BADGE_NAME,
} = require("../src/constants/botStaff");

test("isReservedBotStaffBadge matches stable id and reserved name", () => {
  assert.strictEqual(isReservedBotStaffBadge(BOT_STAFF_BADGE_ID, "Other"), true);
  assert.strictEqual(isReservedBotStaffBadge("random-id", BOT_STAFF_BADGE_NAME), true);
  assert.strictEqual(isReservedBotStaffBadge("random-id", "bot staff"), true);
  assert.strictEqual(isReservedBotStaffBadge("random-id", "Helper"), false);
});

test("isReservedBotStaffBadge blocks lookalike ids and names", () => {
  assert.strictEqual(isReservedBotStaffBadge("bot_staff", null), true);
  assert.strictEqual(isReservedBotStaffBadge("botstaff", null), true);
  assert.strictEqual(isReservedBotStaffBadge("BOT-STAFF", null), true);
  assert.strictEqual(isReservedBotStaffBadge(null, "BOT  STAFF"), true);
  assert.strictEqual(isReservedBotStaffBadge(null, "bot-staff"), true);
  assert.strictEqual(isReservedBotStaffBadge("helper-badge", "Helper"), false);
});

test("badge command blocks reserved bot-staff badge operations", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/commands/devOnly/Developers/badge.js"),
    "utf8"
  );

  assert.match(src, /isReservedBotStaffBadge/);
  assert.match(src, /Use `\/botstaff` to manage it/);
});

test("staffRoles removed from example config and dev validator", () => {
  const configSrc = fs.readFileSync(
    path.join(__dirname, "../src/example.config.js"),
    "utf8"
  );
  const validatorSrc = fs.readFileSync(
    path.join(__dirname, "../src/events/validations/devCommandValidator.js"),
    "utf8"
  );

  assert.doesNotMatch(configSrc, /staffRoles/);
  assert.doesNotMatch(validatorSrc, /staffRoles/);
  assert.match(validatorSrc, /isStaffOnlyAllowed/);
});

test("BotStaff model exists in Prisma schema", () => {
  const schema = fs.readFileSync(
    path.join(__dirname, "../prisma/schema.prisma"),
    "utf8"
  );

  assert.match(schema, /model BotStaff/);
  assert.match(schema, /userId\s+String\s+@unique/);
  assert.match(schema, /addedBy/);
  assert.match(schema, /addedAt/);
});
