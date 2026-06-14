const path = require("path");
const getAllFiles = require("../utils/getAllFiles");
const ascii = require("ascii-table");
const { default: chalk } = require("chalk");

module.exports = (client) => {
  const eventFolders = getAllFiles(path.join(__dirname, "..", "events"), true);

  const table = new ascii().setHeading("Event", "Status");

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    const folderName = eventFolder.replace(/\\/g, "/").split("/").pop();

    if (folderName === "validations") {
      const guildComponents = require("../events/Guild/components");
      const guildInteractionCreate = require("../events/Guild/interactionCreate");

      table.addRow("interactionCreate (validators)", "Loaded");
      client.on("interactionCreate", async (...args) => {
        for (const eventFile of eventFiles) {
          const eventFunction = require(eventFile);
          await eventFunction(client, ...args);
        }
        await guildComponents.run(client, ...args);
        await guildInteractionCreate.run(client, ...args);
      });
      continue;
    }

    const functionHandlers = [];

    for (const eventFile of eventFiles) {
      const fileName = path.basename(eventFile);
      if (fileName === "interactionCreate.js" || fileName === "components.js") {
        continue;
      }

      const eventModule = require(eventFile);

      if (typeof eventModule === "function") {
        functionHandlers.push(eventModule);
      } else if (eventModule && typeof eventModule.run === "function" && eventModule.event) {
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
