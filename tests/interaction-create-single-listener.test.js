/**
 * Regression: interactionCreate validators and Guild handlers must share one
 * sequential listener. Multiple client.on("interactionCreate") registrations
 * run concurrently, so slash commands and components can execute twice before
 * interaction.replied is set.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { EventEmitter } = require("events");

test("events handler chains Guild interactionCreate after validators", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/handlers/events.js"),
    "utf8"
  );

  assert.ok(
    src.includes("interactionCreateFollowups"),
    "expected Guild interactionCreate modules to be collected for chaining"
  );
  assert.ok(
    src.includes('eventModule.event === "interactionCreate"'),
    "expected interactionCreate modules to be deferred instead of separate listeners"
  );
  assert.ok(
    src.includes("for (const followup of interactionCreateFollowups)"),
    "expected followups to run inside the validators listener"
  );
});

test("sequential interactionCreate chain skips guild handler after validator replies", async () => {
  const runs = [];
  const interaction = { id: "i1", replied: false, deferred: false };

  const handlers = [
    async () => {
      runs.push("validator");
      interaction.replied = true;
    },
    async () => {
      if (interaction.replied || interaction.deferred) return;
      runs.push("guild");
    },
  ];

  for (const handler of handlers) {
    await handler();
  }

  assert.deepStrictEqual(runs, ["validator"]);
});

test("parallel listeners can double-run before reply", async () => {
  const client = new EventEmitter();
  const runs = [];
  const interaction = { id: "i1", replied: false, deferred: false };

  client.on("interactionCreate", async () => {
    runs.push("a-start");
    await new Promise((r) => setTimeout(r, 5));
    interaction.replied = true;
    runs.push("a-end");
  });

  client.on("interactionCreate", async () => {
    if (interaction.replied || interaction.deferred) return;
    runs.push("b");
  });

  client.emit("interactionCreate", interaction);
  await new Promise((r) => setTimeout(r, 20));

  assert.ok(
    runs.includes("b"),
    "second listener can run before first listener replies"
  );
});
