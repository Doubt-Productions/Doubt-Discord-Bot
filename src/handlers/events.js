const path = require("path");
const getAllFiles = require("../utils/getAllFiles");
const ascii = require("ascii-table");
const { default: chalk } = require("chalk");

module.exports = (client) => {
  const eventFolders = getAllFiles(path.join(__dirname, "..", "events"), true);

  const table = new ascii().setHeading("Event", "Status");
  const validationHandlers = [];
  const guildInteractionHandlers = [];

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    const folderName = eventFolder.replace(/\\/g, "/").split("/").pop();

    if (folderName === "validations") {
      table.addRow("interactionCreate (validators)", "Loaded");
      validationHandlers.push(async (handlerClient, ...args) => {
        for (const eventFile of eventFiles) {
          const eventFunction = require(eventFile);
          await eventFunction(handlerClient, ...args);
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
          table.addRow("interactionCreate (Guild)", "Loaded");
          guildInteractionHandlers.push((handlerClient, ...args) =>
            eventModule.run(handlerClient, ...args)
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

  const interactionCreateHandlers = [
    ...validationHandlers,
    ...guildInteractionHandlers,
  ];

  if (interactionCreateHandlers.length > 0) {
    client.on("interactionCreate", async (...args) => {
      for (const handler of interactionCreateHandlers) {
        await handler(client, ...args);
      }
    });
  }

  console.log(chalk.green(table.toString()));
};
