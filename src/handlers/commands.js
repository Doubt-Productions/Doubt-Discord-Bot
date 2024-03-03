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
          if (!module.structure?.name || !module.run) {
            log(
              "Unable to load the command " +
              file +
              " due to missing 'structure#name' or/and 'run' properties.",
              "warn"
            );
            table.addRow(module.structure.name, type, "Failed");

            continue;
          }

          table.addRow(module.structure.name, type, "Loaded");

          client.collection.prefixcommands.set(module.structure.name, module);

          if (
            module.structure.aliases &&
            Array.isArray(module.structure.aliases)
          ) {
            module.structure.aliases.forEach((alias) => {
              client.collection.aliases.set(alias, module.structure.name);
            });
          }
        } else if (type === "devOnly") {
          if (!module.structure?.name || !module.run) {
            log(
              "Unable to load the command " +
              file +
              " due to missing 'structure#name' or/and 'run' properties.",
              "warn"
            );

            table.addRow(module.structure.name, type, "Failed");

            continue;
          }

          table.addRow(module.structure.name, type, "Loaded");

          client.collection.developercommands.set(
            module.structure.name,
            module
          );
          client.developerCommandsArray.push(module.structure);
        } else {
          if (!module.structure?.name || !module.run) {
            log(
              "Unable to load the command " +
              file +
              " due to missing 'structure#name' or/and 'run' properties.",
              "warn"
            );

            table.addRow(module.structure.name, type, "Failed");

            continue;
          }

          table.addRow(module.structure.name, type, "Loaded");

          client.collection.interactioncommands.set(
            module.structure.name,
            properties
          );
          client.applicationcommandsArray.push(module.structure);
        }


      }
    }
  }
  console.log(chalk.green(table.toString()));
};
