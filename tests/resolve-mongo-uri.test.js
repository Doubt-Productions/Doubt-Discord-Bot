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

test("resolveMongoUri accepts replica-set URIs that already include a db name", () => {
  const original =
    "mongodb://user:pass@host1:27017,host2:27017/mydb?replicaSet=rs0";
  const { uri, rewritten } = resolveMongoUri(
    original,
    "development",
    "MONGODB_URI"
  );

  assert.strictEqual(rewritten, false);
  assert.strictEqual(uri, original);
});

test("resolveMongoUri appends dbName to replica-set URIs without a path", () => {
  const { uri, rewritten } = resolveMongoUri(
    "mongodb://host1:27017,host2:27017?replicaSet=rs0",
    "production",
    "MONGODB_URI"
  );

  assert.strictEqual(rewritten, true);
  assert.strictEqual(
    uri,
    "mongodb://host1:27017,host2:27017/production?replicaSet=rs0"
  );
});

test("resolveMongoUri preserves credentials when appending dbName", () => {
  const { uri, rewritten } = resolveMongoUri(
    "mongodb://user:p%40ss%3Aword@host:27017",
    "development",
    "DEV_MONGODB_URI"
  );

  assert.strictEqual(rewritten, true);
  assert.strictEqual(
    uri,
    "mongodb://user:p%40ss%3Aword@host:27017/development"
  );
});

test("resolveMongoUri rejects non-mongodb schemes", () => {
  assert.throws(
    () => resolveMongoUri("https://example.com", "development", "DEV_MONGODB_URI"),
    /must start with mongodb/
  );
});
