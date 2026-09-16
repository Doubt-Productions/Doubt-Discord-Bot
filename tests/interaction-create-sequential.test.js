/**
 * Regression: interactionCreate validators and Guild backup routers must run
 * sequentially in one listener. Separate listeners fire concurrently via
 * EventEmitter and can double-execute slash commands (e.g. economy writes).
 */
const { test } = require("node:test");
const assert = require("node:assert");
const { EventEmitter } = require("events");

test("sequential interactionCreate handlers execute only once per interaction", async () => {
  const client = new EventEmitter({ captureRejections: true });
  const interactionCreateHandlers = [];
  let runCount = 0;

  interactionCreateHandlers.push(async (_client, interaction) => {
    if (!interaction.isChatInputCommand()) return;
    runCount += 1;
    await interaction._primaryRun();
  });

  interactionCreateHandlers.push(async (_client, interaction) => {
    if (interaction.replied || interaction.deferred) return;
    if (!interaction.isChatInputCommand()) return;
    runCount += 1;
    await interaction._backupRun();
  });

  client.on("interactionCreate", async (...args) => {
    for (const handler of interactionCreateHandlers) {
      await handler(client, ...args);
    }
  });

  const interaction = {
    isChatInputCommand: () => true,
    replied: false,
    deferred: false,
    async _primaryRun() {
      await new Promise((resolve) => setTimeout(resolve, 5));
      this.replied = true;
    },
    async _backupRun() {
      runCount += 1;
    },
  };

  client.emit("interactionCreate", interaction);
  await new Promise((resolve) => setTimeout(resolve, 20));

  assert.strictEqual(runCount, 1);
});
