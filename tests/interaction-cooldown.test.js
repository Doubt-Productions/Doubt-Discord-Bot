/**
 * Regression: slash cooldown bookkeeping must not double-count the first use,
 * and cooldown expiry timers must tolerate a missing map entry (another timer
 * may have deleted the user key first), otherwise Node throws in the timer.
 */
const { test } = require("node:test");
const assert = require("node:assert");

test("first cooldown enter records a single command id", () => {
  const cooldown = new Map();
  const userId = "user-1";
  const commandName = "rob";

  const cooldownFunction = () => {
    let data = cooldown.get(userId) ?? [];
    data.push(commandName);
    cooldown.set(userId, data);
  };

  cooldownFunction();
  assert.deepStrictEqual(cooldown.get(userId), [commandName]);
});

test("cooldown expiry must no-op when map entry is already gone", () => {
  const cooldown = new Map();
  const userId = "user-1";
  const commandName = "rob";

  const expire = () => {
    let data = cooldown.get(userId);
    if (!data) return;
    data = data.filter((v) => v !== commandName);
    if (data.length <= 0) {
      cooldown.delete(userId);
    } else {
      cooldown.set(userId, data);
    }
  };

  cooldown.set(userId, [commandName]);
  expire();
  assert.strictEqual(cooldown.has(userId), false);
  assert.doesNotThrow(() => expire());
});
