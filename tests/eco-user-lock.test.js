const { test } = require("node:test");
const assert = require("node:assert");
const ecoUserLock = require("../src/utils/ecoUserLock");

test("tryAcquireAll rolls back on partial failure", () => {
  assert.ok(ecoUserLock.tryAcquire("b"));
  assert.ok(!ecoUserLock.tryAcquireAll(["a", "b"]));
  assert.ok(ecoUserLock.tryAcquire("a"));
  ecoUserLock.release("a");
  ecoUserLock.release("b");
});

test("tryAcquireAll acquires in stable order without deadlock", () => {
  assert.ok(ecoUserLock.tryAcquireAll(["z", "a"]));
  assert.ok(!ecoUserLock.tryAcquire("a"));
  assert.ok(!ecoUserLock.tryAcquire("z"));
  ecoUserLock.releaseAll(["z", "a"]);
});
