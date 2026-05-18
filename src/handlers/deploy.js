const { log } = require("../functions");
const config = require("../config");
const commandComparing = require("../utils/commandComparing");
const getApplicationCommands = require("../utils/getApplicationCommands");

/**
 * Registers developer (guild) slash commands without replacing other guild commands.
 * A bulk REST PUT on applicationGuildCommands overwrites the entire guild command set,
 * which races with ready-time slash registration and can delete every non-dev command.
 *
 * @param {*} client discord.js client with `collection.developercommands`
 */
module.exports = async (client) => {
  try {
    log("Started refreshing Developer Commands.", "info");

    const guildId = config.handler.guildId;
    if (!guildId) {
      log(
        "Developer command deploy skipped: config.handler.guildId is unset.",
        "warn"
      );
      return;
    }

    const applicationCommands = await getApplicationCommands(client, guildId);

    for (const moduleEntry of client.collection.developercommands.values()) {
      const localCommand = { data: moduleEntry.data };
      const body = moduleEntry.data.toJSON();
      const commandName = body.name;

      const existingCommand = applicationCommands.cache.find(
        (cmd) => cmd.name === commandName
      );

      if (existingCommand) {
        if (commandComparing(existingCommand, localCommand)) {
          await applicationCommands.edit(existingCommand.id, body);
        }
      } else {
        await applicationCommands.create(body);
      }
    }

    log("Successfully reloaded Developer Commands.", "done");
  } catch (err) {
    log(err, "error");
  }
};
