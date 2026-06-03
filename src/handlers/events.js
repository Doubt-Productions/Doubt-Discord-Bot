const path = require("path");
const getAllFiles = require("../utils/getAllFiles");
const ascii = require("ascii-table");
const { default: chalk } = require("chalk");

function folderName(eventFolder) {
  return eventFolder.replace(/\\/g, "/").split("/").pop();
}

module.exports = (client) => {
  const eventFolders = getAllFiles(path.join(__dirname, "..", "events"), true);
  // Validators must register before Guild interactionCreate handlers so permission
  // checks run before execution and slash/components are not run twice.
  eventFolders.sort((a, b) => {
    const aName = folderName(a);
    const bName = folderName(b);
    if (aName === "validations") return -1;
    if (bName === "validations") return 1;
    return 0;
  });

  const table = new ascii().setHeading("Event", "Status");

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    const name = folderName(eventFolder);

    if (name === "validations") {
      table.addRow("interactionCreate (validators)", "Loaded");
      client.on("interactionCreate", async (...args) => {
        for (const eventFile of eventFiles) {
          const eventFunction = require(eventFile);
          await eventFunction(client, ...args);
        }
      });
      continue;
    }

    const functionHandlers = [];
    const interactionCreateHandlers = [];

    for (const eventFile of eventFiles) {
      const eventModule = require(eventFile);

      if (typeof eventModule === "function") {
        functionHandlers.push(eventModule);
      } else if (eventModule && typeof eventModule.run === "function" && eventModule.event) {
        if (eventModule.event === "interactionCreate") {
          interactionCreateHandlers.push(eventModule.run);
        } else {
          table.addRow(eventModule.event, "Loaded");
          client.on(eventModule.event, async (...args) => {
            await eventModule.run(client, ...args);
          });
        }
      }
    }

    if (interactionCreateHandlers.length > 0) {
      table.addRow("interactionCreate (Guild)", "Loaded");
      client.on("interactionCreate", async (...args) => {
        for (const handler of interactionCreateHandlers) {
          await handler(client, ...args);
        }
      });
    }

    if (functionHandlers.length > 0) {
      table.addRow(name, "Loaded");
      client.on(name, async (...args) => {
        for (const handler of functionHandlers) {
          await handler(client, ...args);
        }
      });
    }
  }

  console.log(chalk.green(table.toString()));
};
