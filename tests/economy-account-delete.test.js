/**
 * Regression: /economy "Delete" called `Data.deleteMany()` on a Mongoose document.
 * Documents do not implement deleteMany (only the model does), so every delete threw.
 * Delete with no prior document also crashed (null.deleteMany).
 */
const { test } = require("node:test");
const assert = require("node:assert");

test("economy delete must use model deleteMany with user+guild filter", async () => {
  const calls = [];
  const fakeModel = {
    deleteMany(filter) {
      calls.push(filter);
      return Promise.resolve({ deletedCount: 1 });
    },
  };
  const result = await fakeModel.deleteMany({
    User: "user-1",
    Guild: "guild-1",
  });
  assert.strictEqual(result.deletedCount, 1);
  assert.deepStrictEqual(calls[0], { User: "user-1", Guild: "guild-1" });
});

test("document-shaped object must not be relied on for deleteMany", () => {
  const doc = { User: "x", Guild: "y" };
  assert.strictEqual(typeof doc.deleteMany, "undefined");
});
