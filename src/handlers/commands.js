const { readdirSync } = require("fs");
const { log } = require("../functions");
const ExtendedClient = require("../class/ExtendedClient");
const AsciiTable = require("ascii-table");
const { default: chalk } = require("chalk");

/**
 *
 * @param {ExtendedClient} client
 */
module.exports = (client) => {
  const table = new AsciiTable(`Doubt | Slash Commands`)
    .setHeading("Command", "Type", "Status");

  for (const type of readdirSync("./src/commands/")) {
    for (const dir of readdirSync("./src/commands/" + type)) {
      for (const file of readdirSync(
        "./src/commands/" + type + "/" + dir
      ).filter((f) => f.endsWith(".js"))) {
        const module = require("../commands/" + type + "/" + dir + "/" + file);
        const properties = { dir, ...module };

        if (!module) continue;

        if (type === "prefix") {
          if (!module.data?.name || !module.run) {
            log(
              "Unable to load the command " +
              file +
              " due to missing 'data#name' or/and 'run' properties.",
              "warn"
            );
            table.addRow(module.data.name, type, "Failed");

            continue;
          }

          table.addRow(module.data.name, type, "Loaded");

          client.collection.prefixcommands.set(module.data.name, module);

          if (
            module.data.aliases &&
            Array.isArray(module.data.aliases)
          ) {
            module.data.aliases.forEach((alias) => {
              client.collection.aliases.set(alias, module.data.name);
            });
          }
        } else if (type === "devOnly") {
          if (!module.data?.name || !module.run) {
            log(
              "Unable to load the command " +
              file +
              " due to missing 'data#name' or/and 'run' properties.",
              "warn"
            );

            table.addRow(module.data.name, type, "Failed");

            continue;
          }

          table.addRow(module.data.name, type, "Loaded");

          client.collection.developercommands.set(
            module.data.name,
            module
          );
          client.developerCommandsArray.push(module.data);
        } else {
          if (!module.data?.name || !module.run) {
            log(
              "Unable to load the command " +
              file +
              " due to missing 'data#name' or/and 'run' properties.",
              "warn"
            );

            table.addRow(module.data.name, type, "Failed");

            continue;
          }

          table.addRow(module.data.name, type, "Loaded");

          client.collection.interactioncommands.set(
            module.data.name,
            properties
          );
          client.applicationcommandsArray.push(module.data);
        }


      }
    }
  }
  console.log(chalk.green(table.toString()));
};
