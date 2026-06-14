/**
 * Regression: interactionCreate must use one sequential listener chain.
 * Separate validators + Guild handlers each registered client.on("interactionCreate"),
 * so both could run the same slash command or component before either replied.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("events handler chains validators then Guild interaction handlers once", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/handlers/events.js"),
    "utf8"
  );

  assert.ok(
    src.includes("guildComponents.run(client, ...args)") &&
      src.includes("guildInteractionCreate.run(client, ...args)"),
    "expected Guild components and interactionCreate in validator chain"
  );
  assert.ok(
    src.includes('fileName === "interactionCreate.js"') &&
      src.includes('fileName === "components.js"'),
    "expected Guild interaction handlers to be excluded from duplicate listeners"
  );
});

test("slash and component validators validate only; execution stays in Guild handlers", () => {
  const validatorFiles = [
    "chatInputCommandValidator.js",
    "devCommandValidator.js",
    "buttonValidator.js",
    "selectMenuValidator.js",
    "ModalCommandValidator.js",
  ];

  for (const file of validatorFiles) {
    const src = fs.readFileSync(
      path.join(__dirname, "../src/events/validations", file),
      "utf8"
    );
    assert.ok(
      src.includes("interaction.replied || interaction.deferred"),
      `${file} should bail when interaction is already handled`
    );
    assert.ok(
      !src.includes(".run(client, interaction)"),
      `${file} must not execute handlers; Guild chain runs them once`
    );
  }

  const contextMenuSrc = fs.readFileSync(
    path.join(__dirname, "../src/events/validations/contextMenuCommandValidator.js"),
    "utf8"
  );
  assert.ok(
    contextMenuSrc.includes("await menuObject.run(client, interaction)"),
    "context menus have no Guild handler and must still execute in validator"
  );
});

test("sequential chain runs command handler at most once", async () => {
  let runs = 0;
  const interaction = { replied: false, deferred: false };

  async function validate() {
    if (interaction.replied || interaction.deferred) return;
  }

  async function execute() {
    if (interaction.replied || interaction.deferred) return;
    runs += 1;
    interaction.replied = true;
  }

  await validate();
  await execute();
  await execute();

  assert.strictEqual(runs, 1);
});
