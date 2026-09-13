const { test } = require("node:test");
const assert = require("node:assert");
const { safeEval } = require("../src/utils/safeEval");

test("safeEval returns expression result", async () => {
  const result = await safeEval("1 + 1", {});
  assert.strictEqual(result, 2);
});

test("safeEval blocks process access", async () => {
  await assert.rejects(
    () => safeEval("process.exit()"),
    /Use of 'process' is not allowed/
  );
});

test("safeEval blocks require", async () => {
  await assert.rejects(
    () => safeEval("require('fs')"),
    /Use of 'require' is not allowed/
  );
});

test("safeEval enforces length limit", async () => {
  await assert.rejects(
    () => safeEval("x".repeat(2001)),
    /2000 character limit/
  );
});
