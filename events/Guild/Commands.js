const {
  EmbedBuilder,
  InteractionType,
  PermissionFlagsBits,
} = require("discord.js");
const client = require("../../index");
const config = require("../../config/config.json");
const BlacklistGuildDB = require("../../Systems/models/BlacklistG");
const BlacklistUserDB = require("../../Systems/models/BlacklistUser");

module.exports = {
  name: "interactionCreate",
};

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const { user, guild, commandName, memberPermissions, member, type } =
      interaction;

    if (!guild || user.bot) return;
    if (!type == 2) return;

    const BlacklistGuildData = await BlacklistGuildDB.findOne({
      Guild: guild.id,
    }).catch((err) => {});
    const BlacklistUserData = await BlacklistUserDB.findOne({
      User: user.id,
    }).catch((err) => {});

    const blacklistEmbed = new EmbedBuilder()
      .setColor("#ff0357")
      .setThumbnail(guild.iconURL())
      .setTimestamp()
      .setFooter({ text: `You have been blacklisted by a bot administrator.` });

    const command = client.commands.get(commandName);

    if (!command) return;
    if (command.ownerOnly && !config.Users.ADMINS.includes(user.id))
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#ff0357")
            .setTimestamp()
            .setFooter({ text: `Permission needed: Bot Administrator.` })
            .setTitle(
              "❌ | You do not have permission to execute this command."
            ),
        ],
      });

    // Blacklist Check
    if (BlacklistGuildData) {
      return interaction.reply({
        embeds: [
          blacklistEmbed
            .setTitle(`Server Blacklisted`)
            .setDescription(
              `You have been blacklisted by a bot administrator.\n\n**Reason:** ${
                BlacklistGuildData.Reason
              }\n**Appeal:** [Appeal Here](${
                config.Users.SUPPORT
              })\n**Blacklisted on:** <t:${parseInt(
                BlacklistGuildData.Time / 1000
              )}:D>`
            ),
        ],
      });
    }

    if (BlacklistUserData) {
      return interaction.reply({
        embeds: [
          blacklistEmbed
            .setTitle(`User Blacklisted`)
            .setDescription(
              `You have been blacklisted by a bot administrator.\n\n**Reason:** ${
                BlacklistUserData.Reason
              }\n**Appeal:** [Appeal Here](${
                config.Users.SUPPORT
              })\n**Blacklisted on:** <t:${parseInt(
                BlacklistUserData.Time / 1000
              )}:D>`
            ),
        ],
        ephemeral: true,
      });
    }

    // Premium Check
    // const User = require("../../Systems/models/UserModel");
    // const cmd = client.commands.get(interaction.commandName);
    // if (cmd) {
    //   let user = client.userSettings.get(interaction.user.id);
    //   // If there is no user, create it in the Database as "newUser"
    //   if (!user) {
    //     const findUser = await User.findOne({ UserID: interaction.user.id });
    //     if (!findUser) {
    //       const newUser = await User.create({ UserID: interaction.user.id });
    //       client.userSettings.set(interaction.user.id, newUser);
    //       user = newUser;
    //     }
    //   }
    //   console.log(user.isPremium);
    //   if (cmd.premium && user && user.isPremium === false) {
    //     return interaction.reply({
    //       content: `This command is only available for Premium Users.`,
    //       ephemeral: true,
    //     });
    //   } else {
    //     cmd.run(client, interaction, config);
    //   }
    // }

    // Permission Check
    try {
      if (command.guild_member_permissions) {
        if (
          !memberPermissions.has(
            PermissionsBitField.resolve(command.guild_member_permissions || [])
          )
        )
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `🚫 Unfortunately, you are not authorized to use this command.`
                )
                .setColor("#ff0357"),
            ],
            ephemeral: true,
          });
      } else if (command.guild_client_permissions) {
        if (
          !guild.members.cache
            .get(client.user.id)
            .permissions.has(
              PermissionsBitField.resolve(
                command.guild_client_permissions || []
              )
            )
        )
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `🚫 Unfortunately, I can't execute this command.`
                )
                .setFooter({
                  text: `Required permissions: ${command.guild_client_permissions.join(
                    ", "
                  )}`,
                })
                .setColor("#ff0357"),
            ],
            ephemeral: true,
          });
      }

      await command.run(client, interaction, config);
    } catch (error) {
      console.log(error);
    }
  } else if (interaction.isButton()) {
    if (interaction.user.id !== interaction.member.id) return;
    const { buttons } = client;
    const { customId } = interaction;
    const button = buttons.get(customId);
    if (!button) return new Error(`Unknown button ${customId}`);

    try {
      await button.execute(interaction, client);
    } catch (error) {
      console.log(
        `[HANDLER - BUTTONS] Couldn't execute the button ${customId}. Error: ${error}.`
          .red
      );
    }
  } else if (interaction.isSelectMenu()) {
    const { menus } = client;
    const { customId } = interaction;
    const menu = menus.get(customId);
    if (!menu) return new Error(`Unknown menu ${customId}`);

    try {
      await menu.execute(interaction, client);
    } catch (error) {
      console.log(
        `[HANDLER - MENUS] Couldn't execute the menu ${customId}. Error: ${error}.`
          .red
      );
    }
  } else if (interaction.type === InteractionType.ModalSubmit) {
    const { modals } = client;
    const { customId } = interaction;
    const modal = modals.get(customId);
    if (!modal) return new Error(`Unknown modal ${customId}`);

    try {
      await modal.execute(interaction, client);
    } catch (error) {
      console.log(
        `[HANDLER - MODALS] Couldn't execute the modal ${customId}. Error: ${error}.`
          .red
      );
    }
  } else if (interaction.isContextMenuCommand()) {
    const { context } = client;
    console.log(context)
    const { customId } = interaction;
    const contextMenu = context.get(customId);
    console.log(contextMenu);
    if (!contextMenu) return new Error(`Unknown context menu ${customId}`);

    try {
      await contextMenu.execute(interaction, client);
    } catch (error) {
      console.log(
        `[HANDLER - CONTEXT MENUS] Couldn't execute the context menu ${customId}. Error: ${error}.`
          .red
      );
    }
  }
});
