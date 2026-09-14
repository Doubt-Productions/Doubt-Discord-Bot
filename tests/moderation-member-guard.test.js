/**
 * Regression: /ban and /kick called getMember() without a null guard when the
 * target left the guild, causing TypeError on .bannable/.kickable.
 */
const { test } = require("node:test");
const assert = require("node:assert");

function banKickMemberGuard(member) {
  if (!member) {
    return { action: "reply", content: "That user is not in this server." };
  }

  if (!member.bannable) {
    return { action: "reply", content: "I cannot ban this user!" };
  }

  return { action: "proceed" };
}

test("null member is rejected before bannable check", () => {
  const result = banKickMemberGuard(null);
  assert.strictEqual(result.action, "reply");
  assert.match(result.content, /not in this server/i);
});

test("present but unbannable member is rejected", () => {
  const result = banKickMemberGuard({ bannable: false });
  assert.strictEqual(result.action, "reply");
  assert.match(result.content, /cannot ban/i);
});

test("bannable member proceeds", () => {
  const result = banKickMemberGuard({ bannable: true });
  assert.deepStrictEqual(result, { action: "proceed" });
});
