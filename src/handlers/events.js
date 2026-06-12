const path = require("path");
const getAllFiles = require("../utils/getAllFiles");
const ascii = require("ascii-table");
const { default: chalk } = require("chalk");

module.exports = (client) => {
  const eventFolders = getAllFiles(path.join(__dirname, "..", "events"), true);

  const table = new ascii().setHeading("Event", "Status");
  // Guild interactionCreate modules must run after validators in the same
  // listener. Separate client.on("interactionCreate") handlers run concurrently
  // and can execute slash commands / components twice before either replies.
  const interactionCreateFollowups = [];

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    const folderName = eventFolder.replace(/\\/g, "/").split("/").pop();

    if (folderName === "validations") {
      table.addRow("interactionCreate (validators)", "Loaded");
      client.on("interactionCreate", async (...args) => {
        for (const eventFile of eventFiles) {
          const eventFunction = require(eventFile);
          await eventFunction(client, ...args);
        }
        for (const followup of interactionCreateFollowups) {
          await followup(client, ...args);
        }
      });
      continue;
    }

    const functionHandlers = [];

    for (const eventFile of eventFiles) {
      const eventModule = require(eventFile);

      if (typeof eventModule === "function") {
        functionHandlers.push(eventModule);
      } else if (eventModule && typeof eventModule.run === "function" && eventModule.event) {
        if (eventModule.event === "interactionCreate") {
          const moduleName = path.basename(eventFile, ".js");
          interactionCreateFollowups.push(async (c, ...args) => {
            await eventModule.run(c, ...args);
          });
          table.addRow(`interactionCreate (${moduleName})`, "Loaded");
          continue;
        }

        table.addRow(eventModule.event, "Loaded");
        client.on(eventModule.event, async (...args) => {
          await eventModule.run(client, ...args);
        });
      }
    }

    if (functionHandlers.length > 0) {
      table.addRow(folderName, "Loaded");
      client.on(folderName, async (...args) => {
        for (const handler of functionHandlers) {
          await handler(client, ...args);
        }
      });
    }
  }

  console.log(chalk.green(table.toString()));
};
