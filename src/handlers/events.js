const path = require("path");
const getAllFiles = require("../utils/getAllFiles");
const ascii = require("ascii-table");
const { default: chalk } = require("chalk");

module.exports = (client) => {
  const eventFolders = getAllFiles(path.join(__dirname, "..", "events"), true);

  const table = new ascii().setHeading("Event", "Status");

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    let eventName;
    eventName = eventFolder.replace(/\\/g, "/").split("/").pop();

    table.addRow(eventName, "Loaded");

    eventName === "validations" ? (eventName = "interactionCreate") : eventName;
    client.on(eventName, async (...args) => {
      for (const eventFile of eventFiles) {
        const eventFunction = require(eventFile);
        await eventFunction(client, ...args);
      }
    });
  }

  console.log(chalk.green(table.toString()));
};
