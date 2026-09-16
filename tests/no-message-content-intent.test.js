/**
 * Regression: bot must stay slash-only without Message Content Intent.
 * Blocks reintroduction of prefix commands, MessageCollector flows, and MCI.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");

function readRepoFile(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function walkJsFiles(relativeDir) {
  const absDir = path.join(repoRoot, relativeDir);
  if (!fs.existsSync(absDir)) return [];

  const files = [];
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    const rel = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkJsFiles(rel));
    } else if (entry.name.endsWith(".js")) {
      files.push(rel);
    }
  }
  return files;
}

test("ExtendedClient does not request MessageContent intent", () => {
  const src = readRepoFile("src/class/ExtendedClient.js");
  assert.doesNotMatch(src, /GatewayIntentBits\.MessageContent/);
});

test("prefix command directory is absent", () => {
  assert.equal(fs.existsSync(path.join(repoRoot, "src/commands/prefix")), false);
});

test("example config does not expose prefix command settings", () => {
  const src = readRepoFile("src/example.config.js");
  assert.doesNotMatch(src, /commands:\s*\{[^}]*prefix:/s);
  assert.doesNotMatch(src, /handler:\s*\{[^}]*prefix:/s);
});

test("no prefix command collections on ExtendedClient", () => {
  const src = readRepoFile("src/class/ExtendedClient.js");
  assert.doesNotMatch(src, /prefixcommands/);
  assert.doesNotMatch(src, /\baliases:\s*new Collection\(\)/);
});

test("no MessageCollector usage in runtime src", () => {
  const offenders = walkJsFiles("src").filter((file) =>
    readRepoFile(file).includes("MessageCollector")
  );
  assert.deepStrictEqual(
    offenders,
    [],
    `MessageCollector found in: ${offenders.join(", ")}`
  );
});

test("guild runtime code does not read message.content", () => {
  const allowedPrefixes = ["src/contextmenus/"];
  const offenders = walkJsFiles("src").filter((file) => {
    if (allowedPrefixes.some((prefix) => file.startsWith(prefix))) {
      return false;
    }
    return readRepoFile(file).includes("message.content");
  });

  assert.deepStrictEqual(
    offenders,
    [],
    `message.content found in: ${offenders.join(", ")}`
  );
});

test("prefix messageCreate router is absent", () => {
  assert.equal(
    fs.existsSync(path.join(repoRoot, "src/events/Guild/messageCreate.js")),
    false
  );
});
