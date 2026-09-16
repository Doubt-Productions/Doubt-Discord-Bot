/**
 * Regression: validation listeners and Guild handlers are separate
 * client.on("interactionCreate") registrations. Node's EventEmitter does not
 * await async listeners, so validators must not call .run() for commands or
 * components that Guild handlers also execute (double deposits, bans, etc.).
 * Context menus are only executed from their validator.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const validationsDir = path.join(
  __dirname,
  "../src/events/validations"
);

const mustNotExecuteRun = [
  "chatInputCommandValidator.js",
  "devCommandValidator.js",
  "buttonValidator.js",
  "selectMenuValidator.js",
  "ModalCommandValidator.js",
];

for (const file of mustNotExecuteRun) {
  test(`${file} validates only and does not invoke component/command run`, () => {
    const src = fs.readFileSync(path.join(validationsDir, file), "utf8");
    assert.ok(
      !/\bawait\s+\w+\.run\s*\(/.test(src),
      `${file} must not await *.run(); execution belongs in Guild handlers`
    );
  });
}

test("contextMenuCommandValidator still executes context menus (no Guild handler)", () => {
  const src = fs.readFileSync(
    path.join(validationsDir, "contextMenuCommandValidator.js"),
    "utf8"
  );
  assert.ok(
    /\bawait\s+menuObject\.run\s*\(/.test(src),
    "context menus are only run from the validator"
  );
});

test("Guild interactionCreate executes slash commands", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/events/Guild/interactionCreate.js"),
    "utf8"
  );
  assert.ok(
    /\bawait\s+command\.run\s*\(/.test(src),
    "slash/dev command execution must remain in interactionCreate"
  );
});

test("Guild components handler executes buttons", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/events/Guild/components.js"),
    "utf8"
  );
  assert.ok(
    /component\.run\s*\(/.test(src),
    "button/select/modal execution must remain in components.js"
  );
});
