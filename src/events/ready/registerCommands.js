const chalk = require("chalk");

const commandComparing = require("../../utils/commandComparing");
const getApplicationCommands = require("../../utils/getApplicationCommands");
const getLocalCommands = require("../../utils/getLocalCommands");
const testServerId = process.env.DEV_GUILD_ID;

module.exports = async (client) => {
  try {
    const localCommands = getLocalCommands();
    const applicationCommands = await getApplicationCommands(
      client,
      testServerId
    );

    for (const localCommand of localCommands) {
      const { data } = localCommand;

      const commandName = data.name;
      const commandDescription = data.description;
      const commandOptions = data.options;

      const existingCommand = await applicationCommands.cache.find(
        (cmd) => cmd.name === commandName
      );

      if (existingCommand) {
        if (localCommand.deleted) {
          await applicationCommands.delete(existingCommand.id);
          console.log(
            chalk.red(`Application command ${commandName} has been deleted.`)
          );
          continue;
        }

        if (commandComparing(existingCommand, localCommand)) {
          await applicationCommands.edit(existingCommand.id, {
            name: commandName,
            description: commandDescription,
            options: commandOptions,
          });
          console.log(
            chalk.yellow(`Application command ${commandName} has been edited.`)
          );
        }
      } else {
        if (localCommand.deleted) {
          console.log(
            chalk.grey(
              `Application command ${commandName} has been skipped, since property "deleted" is set to "true".`
            )
          );
          continue;
        }

        await applicationCommands.create({
          name: commandName,
          description: commandDescription,
          options: commandOptions,
        });
        console.log(
          chalk.green(`Application command ${commandName} has been registered.`)
        );
      }
    }
  } catch (err) {
    console.log(
      chalk.red(`An error occurred while registering commands! ${err.stack}`)
    );
  }
};
