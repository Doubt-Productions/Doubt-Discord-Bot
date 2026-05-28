/**
 * Regression: Guild/* interactionCreate listeners run before the validations
 * chain. Validators also called command.run(), so deposit/withdraw/beg and
 * component handlers executed twice per user action (balance corruption).
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const VALIDATOR_FILES = [
  "chatInputCommandValidator.js",
  "devCommandValidator.js",
  "contextMenuCommandValidator.js",
  "buttonValidator.js",
  "selectMenuValidator.js",
  "ModalCommandValidator.js",
];

const REPLIED_GUARD =
  /interaction\.replied\s*\|\|\s*interaction\.deferred/;

test("validation listeners skip when Guild handler already replied", () => {
  const validationsDir = path.join(
    __dirname,
    "../src/events/validations"
  );

  for (const file of VALIDATOR_FILES) {
    const src = fs.readFileSync(path.join(validationsDir, file), "utf8");
    assert.match(
      src,
      REPLIED_GUARD,
      `${file} must bail out when interaction was already handled`
    );
  }
});

test("Guild components handler awaits async component.run", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/events/Guild/components.js"),
    "utf8"
  );

  assert.ok(
    src.includes("run: async (client, interaction)") &&
      src.includes("await component.run(client, interaction)"),
    "components.js must await component handlers so validators see replied"
  );
});
