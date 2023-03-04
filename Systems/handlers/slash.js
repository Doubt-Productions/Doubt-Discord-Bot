const client = require("../../index");
const config = require("../../config/config.json");
const { PermissionsBitField, Routes, REST } = require("discord.js");
const fs = require("fs");
require("colors");

/**
 *
 * @param {client} client
 * @returns
 */
module.exports = (client) => {
  console.log("0------------------| Slash commands Handler:".blue);

  const { commandArray } = client;

  fs.readdirSync("./commands/").forEach((dir) => {
    const commands = fs
      .readdirSync(`./commands/${dir}`)
      .filter((file) => file.endsWith(".js"));
    for (let file of commands) {
      let command = require(`../../commands/${dir}/${file}`);
      const properties = { dir, ...command };

      if (command.data.name) {
        client.commands.set(command.data.name, properties);
        console.log(
          `[HANDLER - SLASH] Loaded a file: ${command.data.name} (#${client.commands.size})`
            .brightGreen
        );
        commandArray.push(command.data.toJSON());
      } else {
        console.log(
          `[HANDLER - SLASH] Couldn't load the file ${file}, missing module name value.`
            .red
        );
        continue;
      }
    }
  });

  if (!config.Client.ID) {
    console.log(
      "[CRASH] You need to provide your bot ID in config.json!".red + "\n"
    );
    return process.exit();
  }

  const rest = new REST({ version: "10" }).setToken(
    config.Client.TOKEN || process.env.TOKEN
  );

  (async () => {
    try {
      if (config.Handlers.GUILD_ONLY === true) {
        await rest.put(
          Routes.applicationGuildCommands(
            config.Client.ID,
            config.Handlers.GUILD_ID
          ),
          { body: commandArray }
        );

        const GUILD = client.guilds.resolve(config.Handlers.GUILD_ID);

        console.log(
          `[HANDLER - SLASH | WARN] Slash commands has been registered successfully to the guild: ${
            GUILD || "ERR: GUILD_NOT_FOUND"
          }`.red + "\n"
        );
      } else {
        await rest.put(Routes.applicationCommands(config.Client.ID), {
          body: commandArray,
        });

        console.log(
          `[HANDLER - WARN] Slash commands has been registered successfully to all the guilds that the bot were invited.`
            .red + "\n"
        );
      }
    } catch (err) {
      console.log(err);
    }
  })();
};
