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
  const table = new AsciiTable(`Doubt | Components`).setHeading("Component", "Type", "Status");

  for (const dir of readdirSync("./src/components/")) {
    for (const file of readdirSync("./src/components/" + dir).filter((f) =>
      f.endsWith(".js")
    )) {
      const module = require("../components/" + dir + "/" + file);

      if (!module) continue;

      if (dir === "buttons") {
        if (!module.customId || !module.run) {
          log(
            "Unable to load the component " +
            file +
            " due to missing 'structure#customId' or/and 'run' properties.",
            "warn"
          );

          table.addRow(module.customId, dir, "Failed");

          continue;
        }

        table.addRow(module.customId, dir, "Loaded");

        client.collection.components.buttons.set(module.customId, module);
      } else if (dir === "selects") {
        if (!module.customId || !module.run) {
          log(
            "Unable to load the select menu " +
            file +
            " due to missing 'structure#customId' or/and 'run' properties.",
            "warn"
          );

          table.addRow(module.customId, dir, "Failed");

          continue;
        }

        table.addRow(module.customId, dir, "Loaded");

        client.collection.components.selects.set(module.customId, module);
      } else if (dir === "modals") {
        if (!module.customId || !module.run) {
          log(
            "Unable to load the modal " +
            file +
            " due to missing 'structure#customId' or/and 'run' properties.",
            "warn"
          );

          table.addRow(module.customId, dir, "Failed");

          continue;
        }

        table.addRow(module.customId, dir, "Loaded");

        client.collection.components.modals.set(module.customId, module);
      } else {
        log("Invalid component type: " + file, "warn");

        continue;
      }
    }
  }

  console.log(chalk.blue(table.toString()));
};
