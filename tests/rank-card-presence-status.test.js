/**
 * /rank uses canvacord Rank#setStatus, which throws on unknown strings.
 * Without GuildPresences, member.presence is often null; "invisible" is not a canvacord case.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const rankCardPresenceStatus = require("../src/utils/rankCardPresenceStatus");

test("null presence resolves to offline", () => {
  assert.strictEqual(rankCardPresenceStatus({ presence: null }), "offline");
});

test("undefined presence resolves to offline", () => {
  assert.strictEqual(rankCardPresenceStatus({}), "offline");
});

test("invisible maps to offline for canvacord compatibility", () => {
  assert.strictEqual(
    rankCardPresenceStatus({ presence: { status: "invisible" } }),
    "offline"
  );
});

test("supported statuses pass through", () => {
  assert.strictEqual(
    rankCardPresenceStatus({ presence: { status: "dnd" } }),
    "dnd"
  );
  assert.strictEqual(
    rankCardPresenceStatus({ presence: { status: "idle" } }),
    "idle"
  );
});
