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

test("findMemberIdsWithRoles skips bot accounts", () => {
  const members = [
    { userId: "u1", roleIds: ["role-b"], isBot: false },
    { userId: "bot-1", roleIds: ["role-b"], isBot: true },
  ];

  assert.deepStrictEqual(findMemberIdsWithRoles(members, ["role-b"]), ["u1"]);
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

test("migrate refuses when BotStaff already configured without force", async () => {
  const botStaffPath = require.resolve("../src/schemas/botStaff");
  const removalPath = require.resolve("../src/schemas/botStaffRemoval");
  const badgePath = require.resolve("../src/schemas/badge");
  const userPath = require.resolve("../src/schemas/userConfig");
  const botStaffUtilPath = require.resolve("../src/utils/botStaff");
  const originals = {
    botStaff: require.cache[botStaffPath]?.exports,
    removal: require.cache[removalPath]?.exports,
    badge: require.cache[badgePath]?.exports,
    user: require.cache[userPath]?.exports,
    botStaffUtil: require.cache[botStaffUtilPath]?.exports,
  };

  require.cache[botStaffPath] = {
    exports: {
      count: () => Promise.resolve(2),
      findUnique: () => Promise.resolve(null),
      upsert: () => Promise.resolve({}),
    },
  };
  require.cache[removalPath] = {
    exports: {
      findMany: () => Promise.resolve([]),
      deleteMany: () => Promise.resolve(),
      upsert: () => Promise.resolve(),
    },
  };
  require.cache[badgePath] = {
    exports: { findFirst: () => null, create: () => null },
  };
  require.cache[userPath] = {
    exports: { findFirst: () => null, create: () => null, update: () => null },
  };
  delete require.cache[botStaffUtilPath];

  try {
    const { migrateLegacyStaffRoles } = require("../src/utils/botStaff");
    const result = await migrateLegacyStaffRoles(
      { guilds: { fetch: () => Promise.resolve(null) } },
      "dev-1",
      { force: false }
    );
    assert.strictEqual(result.reason, "botstaff_already_configured");
    assert.deepStrictEqual(result.migrated, []);
  } finally {
    if (originals.botStaff !== undefined) {
      require.cache[botStaffPath].exports = originals.botStaff;
    } else {
      delete require.cache[botStaffPath];
    }
    if (originals.removal !== undefined) {
      require.cache[removalPath].exports = originals.removal;
    } else {
      delete require.cache[removalPath];
    }
    if (originals.badge !== undefined) {
      require.cache[badgePath].exports = originals.badge;
    } else {
      delete require.cache[badgePath];
    }
    if (originals.user !== undefined) {
      require.cache[userPath].exports = originals.user;
    } else {
      delete require.cache[userPath];
    }
    if (originals.botStaffUtil !== undefined) {
      require.cache[botStaffUtilPath].exports = originals.botStaffUtil;
    } else {
      delete require.cache[botStaffUtilPath];
    }
  }
});

test("migrate skips tombstoned users who still hold legacy roles", async () => {
  const botStaffPath = require.resolve("../src/schemas/botStaff");
  const removalPath = require.resolve("../src/schemas/botStaffRemoval");
  const badgePath = require.resolve("../src/schemas/badge");
  const userPath = require.resolve("../src/schemas/userConfig");
  const botStaffUtilPath = require.resolve("../src/utils/botStaff");
  const originals = {
    botStaff: require.cache[botStaffPath]?.exports,
    removal: require.cache[removalPath]?.exports,
    badge: require.cache[badgePath]?.exports,
    user: require.cache[userPath]?.exports,
    botStaffUtil: require.cache[botStaffUtilPath]?.exports,
  };

  const upserted = [];
  require.cache[botStaffPath] = {
    exports: {
      count: () => Promise.resolve(0),
      findUnique: () => Promise.resolve(null),
      upsert: (args) => {
        upserted.push(args.create.userId);
        return Promise.resolve({
          userId: args.create.userId,
          addedBy: args.create.addedBy,
          addedAt: new Date(),
        });
      },
    },
  };
  require.cache[removalPath] = {
    exports: {
      findMany: () => Promise.resolve([{ userId: "removed-user" }]),
      deleteMany: () => Promise.resolve(),
      upsert: () => Promise.resolve(),
    },
  };
  require.cache[badgePath] = {
    exports: {
      findFirst: () => Promise.resolve({ badgeId: "bot-staff" }),
      create: () => Promise.resolve(),
    },
  };
  require.cache[userPath] = {
    exports: {
      findFirst: () =>
        Promise.resolve({ id: "u1", user: "new-user", badges: [] }),
      create: () => Promise.resolve({ id: "u1", user: "new-user", badges: [] }),
      update: () => Promise.resolve(),
    },
  };
  delete require.cache[botStaffUtilPath];

  const fakeMembers = [
    {
      id: "removed-user",
      user: { bot: false },
      roles: { cache: new Map([["role-b", {}]]) },
    },
    {
      id: "new-user",
      user: { bot: false },
      roles: { cache: new Map([["role-b", {}]]) },
    },
  ];
  const fakeGuild = {
    members: {
      fetch: () => Promise.resolve(),
      cache: {
        map(callback) {
          return fakeMembers.map(callback);
        },
      },
    },
  };

  try {
    const { migrateLegacyStaffRoles } = require("../src/utils/botStaff");
    const result = await migrateLegacyStaffRoles(
      {
        guilds: {
          fetch: () => Promise.resolve(fakeGuild),
        },
      },
      "dev-1",
      {
        force: false,
        configOverride: {
          moderation: { staffRoles: ["role-b"] },
          variables: { supportServerId: "guild-1" },
          handler: { guildId: "guild-1" },
        },
      }
    );

    assert.deepStrictEqual(result.migrated, ["new-user"]);
    assert.deepStrictEqual(result.skipped, ["removed-user"]);
    assert.deepStrictEqual(upserted, ["new-user"]);
  } finally {
    if (originals.botStaff !== undefined) {
      require.cache[botStaffPath].exports = originals.botStaff;
    } else {
      delete require.cache[botStaffPath];
    }
    if (originals.removal !== undefined) {
      require.cache[removalPath].exports = originals.removal;
    } else {
      delete require.cache[removalPath];
    }
    if (originals.badge !== undefined) {
      require.cache[badgePath].exports = originals.badge;
    } else {
      delete require.cache[badgePath];
    }
    if (originals.user !== undefined) {
      require.cache[userPath].exports = originals.user;
    } else {
      delete require.cache[userPath];
    }
    if (originals.botStaffUtil !== undefined) {
      require.cache[botStaffUtilPath].exports = originals.botStaffUtil;
    } else {
      delete require.cache[botStaffUtilPath];
    }
  }
});

test("dev validator fail-closes staff gate errors with ephemeral reply", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/events/validations/devCommandValidator.js"),
    "utf8"
  );

  assert.match(src, /STAFF_GATE_ERROR_MESSAGE/);
  assert.match(src, /catch \(staffGateErr\)/);
});

test("staffonly and nsfw use staffOnly without developers flag", () => {
  const staffOnlySrc = fs.readFileSync(
    path.join(__dirname, "../src/commands/devOnly/Developers/staffOnly.js"),
    "utf8"
  );
  const nsfwSrc = fs.readFileSync(
    path.join(__dirname, "../src/commands/devOnly/Developers/nsfw.js"),
    "utf8"
  );

  assert.match(staffOnlySrc, /staffOnly:\s*true/);
  assert.doesNotMatch(staffOnlySrc, /developers:\s*true/);
  assert.match(nsfwSrc, /staffOnly:\s*true/);
  assert.doesNotMatch(nsfwSrc, /developers:\s*true/);
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
