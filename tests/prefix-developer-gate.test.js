/**
 * Regression: prefix commands (e.g. Developers/eval) set `data.developers: true`
 * but messageCreate never enforced it, so any member could run prefix eval.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const {
  normalizeIdAllowlist,
} = require("../src/utils/normalizeIdAllowlist");

/** Mirrors messageCreate prefix developer gate */
function prefixDeveloperGate(dataDevelopersFlag, authorId, moderationConfig) {
  if (dataDevelopersFlag !== true) return { action: "allow" };

  const developerIds = normalizeIdAllowlist(moderationConfig?.developers);
  const developerCount = developerIds.length;

  if (developerCount <= 0) {
    return { action: "deny", reason: "misconfigured" };
  }

  if (!developerIds.includes(authorId)) {
    return { action: "deny", reason: "not-in-list" };
  }

  return { action: "allow" };
}

test("prefix eval-style flag is denied when developers list missing", () => {
  const r = prefixDeveloperGate(true, "123", undefined);
  assert.deepStrictEqual(r, { action: "deny", reason: "misconfigured" });
});

test("prefix eval-style flag is denied for non-developer", () => {
  const r = prefixDeveloperGate(true, "intruder", { developers: ["dev1"] });
  assert.deepStrictEqual(r, { action: "deny", reason: "not-in-list" });
});

test("prefix eval-style flag allows listed developer", () => {
  const r = prefixDeveloperGate(true, "dev1", { developers: ["dev1"] });
  assert.deepStrictEqual(r, { action: "allow" });
});

test("normal prefix command skips gate", () => {
  const r = prefixDeveloperGate(undefined, "any", {});
  assert.deepStrictEqual(r, { action: "allow" });
});

test("developers as a single string is misconfigured (no substring bypass)", () => {
  const r = prefixDeveloperGate(true, "10000000000000000", {
    developers: "100000000000000001",
  });
  assert.deepStrictEqual(r, { action: "deny", reason: "misconfigured" });
});
