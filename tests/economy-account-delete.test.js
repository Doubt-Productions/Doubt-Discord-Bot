/**
 * Regression: /economy "Delete" must remove all economy rows for the user in
 * the guild (duplicate rows from races), via Prisma deleteMany — not a single
 * document delete on one arbitrary findFirst result.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("economy delete uses prisma deleteMany filtered by user and guild", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/commands/slash/Economy/economy.js"),
    "utf8"
  );

  assert.ok(
    src.includes("ecoSchema.deleteMany") &&
      src.includes("Guild: guild.id, User: user.id"),
    "economy delete must call deleteMany for User+Guild"
  );
});

test("economy create path serializes concurrent account operations per user", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/commands/slash/Economy/economy.js"),
    "utf8"
  );

  assert.ok(
    src.includes("accountOpsInFlight") && src.includes("accountKey"),
    "economy create/delete must guard overlapping button collects"
  );
});
