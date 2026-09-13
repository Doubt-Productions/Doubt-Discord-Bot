const { test } = require("node:test");
const assert = require("node:assert");
const { resolveMongoUri } = require("../src/utils/resolveMongoUri");

test("resolveMongoUri throws when uri is missing", () => {
  assert.throws(
    () => resolveMongoUri(undefined, "development", "DEV_MONGODB_URI"),
    /Set DEV_MONGODB_URI/
  );
});

test("resolveMongoUri throws when uri is blank", () => {
  assert.throws(
    () => resolveMongoUri("   ", "production", "MONGODB_URI"),
    /Set MONGODB_URI/
  );
});

test("resolveMongoUri appends dbName when path is empty", () => {
  const { uri, rewritten } = resolveMongoUri(
    "mongodb+srv://user:pass@cluster.mongodb.net/",
    "production",
    "MONGODB_URI"
  );

  assert.strictEqual(rewritten, true);
  assert.strictEqual(
    uri,
    "mongodb+srv://user:pass@cluster.mongodb.net/production"
  );
});

test("resolveMongoUri appends dbName before query params", () => {
  const { uri, rewritten } = resolveMongoUri(
    "mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true",
    "development",
    "DEV_MONGODB_URI"
  );

  assert.strictEqual(rewritten, true);
  assert.strictEqual(
    uri,
    "mongodb+srv://user:pass@cluster.mongodb.net/development?retryWrites=true"
  );
});

test("resolveMongoUri does not rewrite uri that already has a db name", () => {
  const original = "mongodb://127.0.0.1:27017/doubt";
  const { uri, rewritten } = resolveMongoUri(
    original,
    "development",
    "DEV_MONGODB_URI"
  );

  assert.strictEqual(rewritten, false);
  assert.strictEqual(uri, original);
});

test("resolveMongoUri defaults dbName to development when unset", () => {
  const { uri, rewritten } = resolveMongoUri(
    "mongodb://localhost:27017",
    undefined,
    "DEV_MONGODB_URI"
  );

  assert.strictEqual(rewritten, true);
  assert.strictEqual(uri, "mongodb://localhost:27017/development");
});
