const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("prisma handler syncs DATABASE_URL before PrismaClient is created", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/handlers/prisma.js"),
    "utf8"
  );

  const syncIndex = src.indexOf("process.env.DATABASE_URL = datasourceUrl");
  const clientIndex = src.indexOf("new PrismaClient");

  assert.notStrictEqual(syncIndex, -1, "expected DATABASE_URL sync assignment");
  assert.notStrictEqual(clientIndex, -1, "expected PrismaClient construction");
  assert.ok(
    syncIndex < clientIndex,
    "DATABASE_URL must be set before PrismaClient is constructed"
  );
});
