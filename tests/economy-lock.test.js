const { test } = require("node:test");
const assert = require("node:assert");
const {
  economyLockKey,
  acquireEconomyLock,
  releaseEconomyLock,
} = require("../src/utils/economyLock");

test("economy lock blocks concurrent handlers for the same user", async () => {
  const key = economyLockKey("guild1", "user1");
  assert.strictEqual(acquireEconomyLock(key), true);
  assert.strictEqual(acquireEconomyLock(key), false);
  releaseEconomyLock(key);
  assert.strictEqual(acquireEconomyLock(key), true);
  releaseEconomyLock(key);
});

test("economy lock is scoped per guild and user", () => {
  const keyA = economyLockKey("guild1", "user1");
  const keyB = economyLockKey("guild1", "user2");
  assert.strictEqual(acquireEconomyLock(keyA), true);
  assert.strictEqual(acquireEconomyLock(keyB), true);
  releaseEconomyLock(keyA);
  releaseEconomyLock(keyB);
});
