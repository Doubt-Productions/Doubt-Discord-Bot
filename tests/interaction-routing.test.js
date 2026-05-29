/**
 * Regression: slash commands and components must not execute in both validators
 * and Guild handlers. Validators gate; Guild/components.js and interactionCreate.js run.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

test("slash validators do not call command.run after validation", () => {
  for (const file of [
    "src/events/validations/chatInputCommandValidator.js",
    "src/events/validations/devCommandValidator.js",
  ]) {
    const src = fs.readFileSync(path.join(root, file), "utf8");
    assert.ok(
      !src.includes("commandObject.run(client, interaction)"),
      `${file} must not execute commands (Guild/interactionCreate handles that)`
    );
  }
});

test("component validators do not call component.run after validation", () => {
  for (const file of [
    "src/events/validations/buttonValidator.js",
    "src/events/validations/selectMenuValidator.js",
    "src/events/validations/ModalCommandValidator.js",
  ]) {
    const src = fs.readFileSync(path.join(root, file), "utf8");
    assert.ok(
      !/\.run\(client,\s*interaction\)/.test(src),
      `${file} must not execute components (Guild/components handles that)`
    );
  }
});

test("context menu validator still executes (no Guild handler)", () => {
  const src = fs.readFileSync(
    path.join(root, "src/events/validations/contextMenuCommandValidator.js"),
    "utf8"
  );
  assert.ok(
    src.includes("menuObject.run(client, interaction)"),
    "context menus are only routed through the validator chain"
  );
});
