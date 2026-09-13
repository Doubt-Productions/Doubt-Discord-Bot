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

test("safeEval blocks constructor-chain process escape", async () => {
  const bypass =
    "const x='pro'+'cess'; const C=(function(){return this;})().constructor.constructor; C('return '+x)().env";
  await assert.rejects(() => safeEval(bypass), /not allowed/);
});

test("safeEval blocks dot-constructor access", async () => {
  await assert.rejects(
    () => safeEval("''.split.constructor('return 1')()"),
    /not allowed/
  );
});
