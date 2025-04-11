const ExtendedClient = require("../../class/ExtendedClient");
const { dependencies } = require("../../../package.json");
const { version } = require("discord.js");
const getApplicationCommands = require("../../utils/getApplicationCommands");
const getLocalCommands = require("../../utils/getLocalCommands");

const red = "\x1b[31m";
const magenta = "\x1b[35m";
const white = "\x1b[37m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const blue = "\x1b[34m";
const underline = "\x1b[4m";
const bold = "\x1b[1m";
const reset = "\x1b[0m";

/**
 *
 * @param {ExtendedClient} client
 * @returns
 */
module.exports = async (client) => {
  console.log(
    `\n————————————————————[${client.user.username} Information]————————————————————`.replace(
      /(^\n.*$)/g,
      `${red + bold}$1${reset}`
    )
  );
  const clientData = [
    {
      User: client.user.tag,
      ID: client.user.id,
      Members: client.guilds.cache
        .reduce((a, b) => a + b.memberCount, 0)
        .toLocaleString("en"),
      Servers: client.guilds.cache.size,
    },
  ];
  const commandData = [
    {
      SlashCommands: client.collection.interactioncommands.size,
      PrefixCommands: client.collection.prefixcommands.size,
      DeveloperCommands: client.collection.developercommands.size,
      Aliases: client.collection.aliases.size,
      TotalCommands:
        client.collection.interactioncommands.size +
        client.collection.prefixcommands.size +
        client.collection.developercommands.size,
    },
  ];

  console.table(clientData);
  console.table(commandData);

  console.log(
    `Invite: https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=415306870006&scope=bot%20applications.commands`

      .replace(/(Invite: )/, `${white + bold}$1${blue}${underline}`)

      .concat(reset)
  );
  console.log(
    `Running Node: ${process.version} on ${process.platform} ${process.arch}`

      .replace(/(Running Node: )/, `${white + bold}$1${magenta}${bold}`)

      .replace(/( on )/, `${white + bold}$1${magenta}${bold}`)
      .replace("win32", "Windows")

      .concat(reset)
  );
  console.log(
    `Discord.js Version: ${version}`
      .replace(/(Discord.js Version: )/, `${white + bold}$1${green}${bold}`)
      .concat(reset)
  );

  console.log(
    `Logged in on discord as: ${client.user.tag}`
      .replace(/(Logged in on discord as: )/, `${white + bold}$1${green}`)
      .concat(reset)
  );
};
