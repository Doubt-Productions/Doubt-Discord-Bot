const testServerId = process.env.DEV_GUILD_ID;
const { default: chalk } = require("chalk");
const getApplicationContextMenus = require("../../utils/getApplicationCommands");
const getLocalContextMenus = require("../../utils/getLocalContextMenus");

module.exports = async (client) => {
  try {
    const localContextMenus = getLocalContextMenus();
    const applicationContextMenus = await getApplicationContextMenus(
      client,
      testServerId
    );

    for (const localContextMenu of localContextMenus) {
      const { data } = localContextMenu;

      const contextMenuName = data.name;
      const contextMenuType = data.type;

      const existingContextMenu = await applicationContextMenus.cache.find(
        (cmd) => cmd.name === contextMenuName
      );

      if (existingContextMenu) {
        if (localContextMenu.deleted) {
          await applicationContextMenus.delete(existingContextMenu.id);
          console.log(
            chalk.red(
              `Application command ${contextMenuName} has been deleted.`
            )
          );
          continue;
        }
      } else {
        if (localContextMenu.deleted) {
          console.log(
            chalk.grey(
              `Application command ${contextMenuName} has been skipped, since property "deleted" is set to "true".`
            )
          );
          continue;
        }

        await applicationContextMenus.create({
          name: contextMenuName,
          type: contextMenuType,
        });
        console.log(
          chalk.green(
            `Application command ${contextMenuName} has been registered.`
          )
        );
      }
    }
  } catch (err) {
    console.log(
      chalk.red(`An error occurred while registering context menu's! ${err}`)
    );
  }
};
