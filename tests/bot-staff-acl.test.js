const { test } = require("node:test");
const assert = require("node:assert");
const { isStaffGateAllowed } = require("../src/utils/botStaffAcl");

const DEVELOPER_IDS = ["111111111111111111"];

test("isStaffGateAllowed grants developers without BotStaff record", () => {
  const allowed = isStaffGateAllowed(
    "111111111111111111",
    DEVELOPER_IDS,
    false
  );
  assert.strictEqual(allowed, true);
});

test("isStaffGateAllowed grants BotStaff members who are not developers", () => {
  const allowed = isStaffGateAllowed(
    "222222222222222222",
    DEVELOPER_IDS,
    true
  );
  assert.strictEqual(allowed, true);
});

test("isStaffGateAllowed denies users who are neither developers nor bot staff", () => {
  const allowed = isStaffGateAllowed(
    "222222222222222222",
    DEVELOPER_IDS,
    false
  );
  assert.strictEqual(allowed, false);
});

test("addBotStaff upserts ACL and syncs badge", async () => {
  const events = [];
  const fakeBotStaff = {
    upsert(args) {
      events.push(["upsert", args]);
      return Promise.resolve({
        userId: args.create.userId,
        addedBy: args.create.addedBy,
        addedAt: new Date("2026-01-01T00:00:00Z"),
      });
    },
  };
  const fakeBadges = {
    findFirst() {
      events.push(["badgeFind"]);
      return Promise.resolve({ badgeId: "bot-staff" });
    },
    create() {
      throw new Error("should not create when catalog exists");
    },
  };
  const fakeUsers = {
    findFirst() {
      events.push(["userFind"]);
      return Promise.resolve({
        id: "u1",
        user: "555555555555555555",
        badges: [],
      });
    },
    create() {
      throw new Error("should not create when user exists");
    },
    update(args) {
      events.push(["userUpdate", args]);
      return Promise.resolve(args.data);
    },
  };

  const botStaffPath = require.resolve("../src/schemas/botStaff");
  const badgePath = require.resolve("../src/schemas/badge");
  const userPath = require.resolve("../src/schemas/userConfig");
  const botStaffUtilPath = require.resolve("../src/utils/botStaff");
  const originals = {
    botStaff: require.cache[botStaffPath]?.exports,
    badge: require.cache[badgePath]?.exports,
    user: require.cache[userPath]?.exports,
    botStaffUtil: require.cache[botStaffUtilPath]?.exports,
  };

  require.cache[botStaffPath] = { exports: fakeBotStaff };
  require.cache[badgePath] = { exports: fakeBadges };
  require.cache[userPath] = { exports: fakeUsers };
  delete require.cache[botStaffUtilPath];

  try {
    const { addBotStaff } = require("../src/utils/botStaff");
    const record = await addBotStaff("555555555555555555", "111111111111111111");
    assert.strictEqual(record.userId, "555555555555555555");
    assert.ok(events.some((e) => e[0] === "upsert"));
    assert.ok(events.some((e) => e[0] === "userUpdate"));
  } finally {
    if (originals.botStaff !== undefined) {
      require.cache[botStaffPath].exports = originals.botStaff;
    } else {
      delete require.cache[botStaffPath];
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

test("removeBotStaff deletes ACL and removes badge", async () => {
  const events = [];
  const fakeBotStaff = {
    findUnique({ where }) {
      events.push(["find", where.userId]);
      return Promise.resolve(
        where.userId === "666666666666666666"
          ? { userId: where.userId }
          : null
      );
    },
    delete({ where }) {
      events.push(["delete", where.userId]);
      return Promise.resolve();
    },
  };
  const fakeUsers = {
    findFirst() {
      return Promise.resolve({
        id: "u2",
        user: "666666666666666666",
        badges: ["bot-staff", "other"],
      });
    },
    update(args) {
      events.push(["userUpdate", args.data.badges]);
      return Promise.resolve();
    },
  };

  const botStaffPath = require.resolve("../src/schemas/botStaff");
  const badgePath = require.resolve("../src/schemas/badge");
  const userPath = require.resolve("../src/schemas/userConfig");
  const botStaffUtilPath = require.resolve("../src/utils/botStaff");
  const originals = {
    botStaff: require.cache[botStaffPath]?.exports,
    badge: require.cache[badgePath]?.exports,
    user: require.cache[userPath]?.exports,
    botStaffUtil: require.cache[botStaffUtilPath]?.exports,
  };

  require.cache[botStaffPath] = { exports: fakeBotStaff };
  require.cache[badgePath] = {
    exports: { findFirst: () => null, create: () => null },
  };
  require.cache[userPath] = { exports: fakeUsers };
  delete require.cache[botStaffUtilPath];

  try {
    const { removeBotStaff } = require("../src/utils/botStaff");
    const removed = await removeBotStaff("666666666666666666");
    assert.strictEqual(removed.userId, "666666666666666666");
    assert.deepStrictEqual(events.find((e) => e[0] === "userUpdate")[1], [
      "other",
    ]);
  } finally {
    if (originals.botStaff !== undefined) {
      require.cache[botStaffPath].exports = originals.botStaff;
    } else {
      delete require.cache[botStaffPath];
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
