/**
 * Documents the /rob victim lock: the in-memory lock must be taken before any
 * await, or two concurrent /rob calls against the same target can both read a
 * stale wallet and corrupt balances.
 */
const { test } = require("node:test");
const assert = require("node:assert");

test("unsafe pattern: check then await then lock allows double entry on same victim", async () => {
  const victimLock = [];

  async function handler(victimId) {
    if (victimLock.includes(victimId)) return "busy";
    await Promise.resolve();
    victimLock.push(victimId);
    return "ok";
  }

  const [a, b] = await Promise.all([handler("v1"), handler("v1")]);
  assert.strictEqual(a, "ok");
  assert.strictEqual(b, "ok");
  assert.strictEqual(victimLock.filter((x) => x === "v1").length, 2);
});

test("safe pattern: lock before await blocks the second concurrent call", async () => {
  const victimLock = [];

  async function handler(victimId) {
    if (victimLock.includes(victimId)) return "busy";
    victimLock.push(victimId);
    await Promise.resolve();
    return "ok";
  }

  const [a, b] = await Promise.all([handler("v1"), handler("v1")]);
  assert.ok(a === "ok" || b === "ok");
  assert.ok(a === "busy" || b === "busy");
  assert.strictEqual(victimLock.filter((x) => x === "v1").length, 1);
});
