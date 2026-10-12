const { log } = require("../../functions");
const ExtendedClient = require("../../class/ExtendedClient");

function resolveModal(client, customId) {
  const exact = client.collection.components.modals.get(customId);
  if (exact) return exact;

  for (const [registeredId, modal] of client.collection.components.modals) {
    if (customId.startsWith(`${registeredId}:`)) {
      return modal;
    }
  }

  return null;
}

module.exports = {
  event: "interactionCreate",
  /**
   * @param {ExtendedClient} client
   * @param {import("discord.js").Interaction} interaction
   */
  run: async (client, interaction) => {
    if (interaction.replied || interaction.deferred) return;

    if (interaction.isButton()) {
      const component = client.collection.components.buttons.get(
        interaction.customId
      );
      if (!component) return;

      try {
        await component.run(client, interaction);
      } catch (error) {
        log(error, "error");
      }
      return;
    }

    if (interaction.isAnySelectMenu()) {
      const component = client.collection.components.selects.get(
        interaction.customId
      );
      if (!component) return;

      try {
        await component.run(client, interaction);
      } catch (error) {
        log(error, "error");
      }
      return;
    }

    if (interaction.isModalSubmit()) {
      const component = resolveModal(client, interaction.customId);
      if (!component) return;

      try {
        await component.run(client, interaction);
      } catch (error) {
        log(error, "error");
      }
    }
  },
};
