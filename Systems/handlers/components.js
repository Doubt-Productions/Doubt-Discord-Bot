const fs = require("fs");
require("colors");
const client = require("../../index");

/**
 *
 * @param {client} client
 */
module.exports = (client) => {
  console.log("0------------------| Component Handler:".blue);

  const componentFolders = fs.readdirSync(`./components`);
  for (const folder of componentFolders) {
    const componentFiles = fs
      .readdirSync(`./components/${folder}`)
      .filter((file) => file.endsWith(".js"));

    const { buttons, menus, modals, commands } = client;

    switch (folder) {
      case "buttons":
        for (const file of componentFiles) {
          const button = require(`../../components/${folder}/${file}`);
          if (button.data.name) {
            buttons.set(button.data.name, button);
            console.log(
              `[HANDLER - BUTTONS] Loaded a file: ${button.data.name}`
                .brightGreen
            );
          } else {
            console.log(
              `[HANDLER - BUTTONS] Couldn't load the file ${file}. missing name or aliases.`
                .red
            );
          }
        }
        break;
      case "menus":
        for (const file of componentFiles) {
          const menu = require(`../../components/${folder}/${file}`);
          if (menu.data.name) {
            menus.set(menu.data.name, menu);
            console.log(
              `[HANDLER - MENUS] Loaded a file: ${menu.data.name}`.brightGreen
            );
          } else {
            console.log(
              `[HANDLER - MENUS] Couldn't load the file ${file}. missing name or aliases.`
                .red
            );
          }
        }
        break;

      case "modals":
        for (const file of componentFiles) {
          const modal = require(`../../components/${folder}/${file}`);
          if (modal.data.name) {
            modals.set(modal.data.name, modal);
            console.log(
              `[HANDLER - MODALS] Loaded a file: ${modal.data.name}`.brightGreen
            );
          } else {
            console.log(
              `[HANDLER - MODALS] Couldn't load the file ${file}. missing name or aliases.`
                .red
            );
          }
        }
        break;
      
        case "context":
        for (const file of componentFiles) {
          const context = require(`../../components/${folder}/${file}`);
          if (context.data.name) {
            commands.set(context.data.name, context);
            console.log(
              `[HANDLER - CONTEXT] Loaded a file: ${context.data.name}`.brightGreen
            );
          } else {
            console.log(
              `[HANDLER - CONTEXT] Couldn't load the file ${file}. missing name or aliases.`
                .red
            );
          }
        }
        break;
    }
  }
};
