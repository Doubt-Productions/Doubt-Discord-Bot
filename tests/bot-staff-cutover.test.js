const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { getStaffOnlyDenialMessage } = require("../src/utils/botStaffAcl");
const {
  getLegacyStaffRoleIds,
  resolveMigrationGuildId,
  findMemberIdsWithRoles,
} = require("../src/utils/botStaffMigration");

test("getStaffOnlyDenialMessage explains empty BotStaff ACL cutover", () => {
  const message = getStaffOnlyDenialMessage({ hasAnyBotStaff: false });
  assert.match(message, /not configured yet/i);
  assert.match(message, /\/botstaff migrate/);
  assert.match(message, /\/botstaff add/);
});

test("getStaffOnlyDenialMessage explains per-user denial when ACL exists", () => {
  const message = getStaffOnlyDenialMessage({ hasAnyBotStaff: true });
  assert.match(message, /restricted to global bot staff/i);
  assert.match(message, /\/botstaff add/);
  assert.doesNotMatch(message, /not configured yet/i);
});

test("getLegacyStaffRoleIds ignores empty strings and non-arrays", () => {
  assert.deepStrictEqual(getLegacyStaffRoleIds(["111", "", "222"]), [
    "111",
    "222",
  ]);
  assert.deepStrictEqual(getLegacyStaffRoleIds("111"), []);
});

test("resolveMigrationGuildId prefers supportServerId", () => {
  assert.strictEqual(
    resolveMigrationGuildId("support-guild", "handler-guild"),
    "support-guild"
  );
  assert.strictEqual(resolveMigrationGuildId("", "handler-guild"), "handler-guild");
  assert.strictEqual(resolveMigrationGuildId("", ""), null);
});

test("findMemberIdsWithRoles returns members holding any legacy role", () => {
  const members = [
    { userId: "u1", roleIds: ["role-a", "role-b"] },
    { userId: "u2", roleIds: ["role-c"] },
    { userId: "u3", roleIds: ["role-b"] },
  ];

  assert.deepStrictEqual(
    findMemberIdsWithRoles(members, ["role-b"]),
    ["u1", "u3"]
  );
});

test("dev validator uses explicit staffOnly denial helper", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/events/validations/devCommandValidator.js"),
    "utf8"
  );

  assert.match(src, /getStaffOnlyDenialMessage/);
  assert.match(src, /hasBotStaffConfigured/);
  assert.doesNotMatch(src, /This is a staff only command\./);
});

test("botstaff command exposes migrate subcommand", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/commands/devOnly/Developers/botstaff.js"),
    "utf8"
  );

  assert.match(src, /\.setName\("migrate"\)/);
  assert.match(src, /migrateLegacyStaffRoles/);
  assert.match(src, /BOT_STAFF_MIGRATE_WARNING/);
});

test("dev validator routes staffOnly commands through BotStaff gate only", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/events/validations/devCommandValidator.js"),
    "utf8"
  );

  assert.match(src, /usesStaffOnlyGate/);
  assert.match(src, /requiresDeveloperGate/);
  const staffGateIndex = src.indexOf("usesStaffOnlyGate(commandObject)");
  const developerGateIndex = src.indexOf("requiresDeveloperGate(commandObject)");
  assert.ok(staffGateIndex > -1);
  assert.ok(developerGateIndex > -1);
  assert.ok(staffGateIndex < developerGateIndex);
});
