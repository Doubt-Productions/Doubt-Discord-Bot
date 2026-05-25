const { REST, Routes } = require("discord.js");
const { log } = require("../functions");
const config = require("../config");

/**
 * Bulk-registers developer-only guild commands (replaces the guild command list).
 * Slash commands from `registerCommands` must run after this on startup.
 *
 * @param {import("../class/ExtendedClient")} client
 */
module.exports = async (client) => {
  const rest = new REST({ version: "10" }).setToken(config.client.token);

  try {
    log("Started refreshing Developer Commands.", "info");

    const devCommands = client.collection.developercommands.map((command) =>
      command.data.toJSON()
    );

    await rest.put(
      Routes.applicationGuildCommands(client.user.id, config.handler.guildId),
      {
        body: devCommands,
      }
    );

    log("Successfully reloaded Developer Commands.", "done");
  } catch (err) {
    log(err, "error");
  }
};
