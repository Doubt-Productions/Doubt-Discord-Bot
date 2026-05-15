/**
 * Documents the /rob cooldown race: the in-memory lock must be taken before any
 * await, or two concurrent handlers can both pass `timeout.includes(userId)` and
 * apply overlapping balance updates (economy corruption).
 */
const { test } = require("node:test");
const assert = require("node:assert");

test("unsafe pattern: check then await then lock allows double entry", async () => {
  const timeout = [];

  async function handler(id) {
    if (timeout.includes(id)) return "cooldown";
    await Promise.resolve();
    timeout.push(id);
    return "ok";
  }

  const [a, b] = await Promise.all([handler("u1"), handler("u1")]);
  assert.strictEqual(a, "ok");
  assert.strictEqual(b, "ok");
  assert.strictEqual(timeout.filter((x) => x === "u1").length, 2);
});

test("safe pattern: lock before await blocks the second concurrent call", async () => {
  const timeout = [];

  async function handler(id) {
    if (timeout.includes(id)) return "cooldown";
    timeout.push(id);
    await Promise.resolve();
    return "ok";
  }

  const [a, b] = await Promise.all([handler("u1"), handler("u1")]);
  assert.ok(a === "ok" || b === "ok");
  assert.ok(a === "cooldown" || b === "cooldown");
  assert.strictEqual(timeout.filter((x) => x === "u1").length, 1);
});
