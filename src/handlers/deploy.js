const { REST, Routes } = require("discord.js");
const { log } = require("../functions");
const config = require("../config");
const ExtendedClient = require("../class/ExtendedClient");

/**
 *
 * @param {ExtendedClient} client
 */
module.exports = async (client) => {
  const rest = new REST({ version: "10" }).setToken(
    process.env.CLIENT_TOKEN || config.client.token
  );

  if (config.handler.guildDeploy === true) {
    try {
      log(
        "Started loading guild application commands... (this might take minutes!)",
        "warn"
      );

      await rest.put(
        Routes.applicationGuildCommands(
          config.client.id,
          config.handler.guildId
        ),
        {
          body: client.applicationcommandsArray,
        }
      );

      await rest.put(
        Routes.applicationGuildCommands(
          config.client.id,
          config.handler.guildId
        ),
        {
          body: client.developerCommandsArray,
        }
      );

      log(
        "Successfully loaded guild application commands to Discord API.",
        "done"
      );
    } catch (e) {
      log(
        "Unable to load guild application commands to Discord API. " + e,
        "err"
      );
    }
  } else if (config.handler.guildDeploy === false) {
    try {
      log(
        "Started loading application commands... (this might take minutes!)",
        "warn"
      );

      await rest.put(Routes.applicationCommands(config.client.id), {
        body: client.applicationcommandsArray,
      });

      await rest
        .put(
          Routes.applicationGuildCommands(
            config.client.id,
            config.handler.guildId
          ),
          {
            body: client.developerCommandsArray,
          }
        )
        .then(() =>
          log("Successfully loaded developer commands to the guild id!", "done")
        );

      log("Successfully loaded application commands to Discord API.", "done");
    } catch (e) {
      log("Unable to load application commands to Discord API. " + e, "err");
    }
  }
};
