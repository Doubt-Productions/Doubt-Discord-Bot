/**
 * Runs before other ready handlers (see filename sort order in getAllFiles).
 * deploy() bulk-PUTs only developer guild commands, which replaces the entire
 * guild command list; registerCommands must run afterward to re-register slash
 * commands. Calling deploy from ExtendedClient after login raced registerCommands
 * and could finish last, wiping all non-developer slash commands from the guild.
 */
module.exports = async (client) => {
  const deploy = require("../../handlers/deploy");
  await deploy(client);
};
