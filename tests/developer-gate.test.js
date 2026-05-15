/**
 * Regression: when config.moderation.developers is undefined, the old control flow
 * never matched either branch (undefined > 0 and undefined <= 0 are both false),
 * so developer-only commands were not blocked.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const {
  normalizeIdAllowlist,
} = require("../src/utils/normalizeIdAllowlist");

/** Mirrors interactionCreate developer gate decision */
function developerGateDecision(developersOption, userId, moderationConfig) {
  if (!developersOption) return { action: "allow" };

  const developerIds = normalizeIdAllowlist(moderationConfig?.developers);
  const developerCount = developerIds.length;

  if (developerCount <= 0) {
    return { action: "deny", reason: "misconfigured" };
  }

  if (!developerIds.includes(userId)) {
    return { action: "deny", reason: "not-in-list" };
  }

  return { action: "allow" };
}

test("undefined developers list is denied as misconfigured", () => {
  const r = developerGateDecision(true, "123", { developers: undefined });
  assert.deepStrictEqual(r, { action: "deny", reason: "misconfigured" });
});

test("missing moderation section is denied as misconfigured", () => {
  const r = developerGateDecision(true, "123", undefined);
  assert.deepStrictEqual(r, { action: "deny", reason: "misconfigured" });
});

test("empty developers array is denied as misconfigured", () => {
  const r = developerGateDecision(true, "123", { developers: [] });
  assert.deepStrictEqual(r, { action: "deny", reason: "misconfigured" });
});

test("allowlisted user is allowed", () => {
  const r = developerGateDecision(true, "user-a", {
    developers: ["user-a", "user-b"],
  });
  assert.deepStrictEqual(r, { action: "allow" });
});

test("non-allowlisted user is denied", () => {
  const r = developerGateDecision(true, "intruder", {
    developers: ["user-a"],
  });
  assert.deepStrictEqual(r, { action: "deny", reason: "not-in-list" });
});

test("non-developer command skips gate", () => {
  const r = developerGateDecision(false, "any", {});
  assert.deepStrictEqual(r, { action: "allow" });
});

test("developers as a single string is misconfigured, not substring-matched", () => {
  const r = developerGateDecision(true, "10000000000000000", {
    developers: "100000000000000001",
  });
  assert.deepStrictEqual(r, { action: "deny", reason: "misconfigured" });
});
