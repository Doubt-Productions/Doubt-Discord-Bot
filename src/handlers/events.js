const path = require("path");
const getAllFiles = require("../utils/getAllFiles");
const ascii = require("ascii-table");
const { default: chalk } = require("chalk");

module.exports = (client) => {
  const eventFolders = getAllFiles(path.join(__dirname, "..", "events"), true);

  const table = new ascii().setHeading("Event", "Status");
  const interactionCreateHandlers = [];

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    const folderName = eventFolder.replace(/\\/g, "/").split("/").pop();

    if (folderName === "validations") {
      for (const eventFile of eventFiles) {
        interactionCreateHandlers.push(require(eventFile));
      }
      continue;
    }

    const functionHandlers = [];

    for (const eventFile of eventFiles) {
      const eventModule = require(eventFile);

      if (typeof eventModule === "function") {
        functionHandlers.push(eventModule);
      } else if (eventModule && typeof eventModule.run === "function" && eventModule.event) {
        if (eventModule.event === "interactionCreate") {
          interactionCreateHandlers.push((client, ...args) =>
            eventModule.run(client, ...args)
          );
        } else {
          table.addRow(eventModule.event, "Loaded");
          client.on(eventModule.event, async (...args) => {
            await eventModule.run(client, ...args);
          });
        }
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

  if (interactionCreateHandlers.length > 0) {
    table.addRow("interactionCreate", "Loaded");
    client.on("interactionCreate", async (...args) => {
      for (const handler of interactionCreateHandlers) {
        await handler(client, ...args);
      }
    });
  }

  console.log(chalk.green(table.toString()));
};
