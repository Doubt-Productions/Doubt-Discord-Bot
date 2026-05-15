const config = require("../../config");
const { log } = require("../../functions");
const ExtendedClient = require("../../class/ExtendedClient");
const { ChatInputCommandInteraction } = require("discord.js");

const cooldown = new Map();

module.exports = {
  event: "interactionCreate",
  /**
   *
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @returns
   */
  run: async (client, interaction) => {
    if (!interaction.isCommand()) return;


    if (
      config.handler.commands.slash === false &&
      interaction.isChatInputCommand()
    )
      return;
    if (
      config.handler.commands.user === false &&
      interaction.isUserContextMenuCommand()
    )
      return;
    if (
      config.handler.commands.message === false &&
      interaction.isMessageContextMenuCommand()
    )
      return;

    const command = client.collection.interactioncommands.get(
      interaction.commandName
    ) || client.collection.developercommands.get(interaction.commandName);
    
    if (!command) return;

    try {
      if (command.options?.developers) {
        const developerIds = config.moderation?.developers;
        const developerCount = developerIds?.length ?? 0;

        if (developerCount <= 0) {
          await interaction.reply({
            content: `This is a developer only command, but unable to execute due to missing user IDs in configuration file.`,
            ephemeral: true,
          });

          return;
        }

        if (!developerIds.includes(interaction.user.id)) {
          await interaction.reply({
            content: `This is a developer only command.`,
            ephemeral: true,
          });

          return;
        }
      }

      if (command.options?.staffOnly) {
        const member = interaction.member;

        const staffRoleIds = config.moderation?.staffRoles ?? [];

        if (
          !member?.roles?.cache?.some((role) =>
            staffRoleIds.includes(role.id)
          )
        ) {
          await interaction.reply({
            content: `This is a staff only command.`,
            ephemeral: true,
          });
          return;
        }
      }

      if (command.options?.nsfw && !interaction.channel.nsfw) {
        await interaction.reply({
          content: "The current channel is not an NSFW channel.",
          ephemeral: true,
        });

        return;
      }

      if (command.options?.cooldown) {
        const cooldownFunction = () => {
          const userId = interaction.user.id;
          const commandName = interaction.commandName;
          let data = cooldown.get(userId) ?? [];

          data.push(commandName);

          cooldown.set(userId, data);

          setTimeout(() => {
            let data = cooldown.get(userId);
            if (!data) return;

            data = data.filter((v) => v !== commandName);

            if (data.length <= 0) {
              cooldown.delete(userId);
            } else {
              cooldown.set(userId, data);
            }
          }, command.options?.cooldown);
        };

        if (cooldown.has(interaction.user.id)) {
          let data = cooldown.get(interaction.user.id);

          if (data.some((v) => v === interaction.commandName)) {
            await interaction.reply({
              content: "Slow down buddy! You're too fast to use this command.",
            });

            return;
          } else {
            cooldownFunction();
          }
        } else {
          cooldownFunction();
        }
      }

      await command.run(client, interaction);
    } catch (error) {
      log(error, "err");
    }
  },
};
