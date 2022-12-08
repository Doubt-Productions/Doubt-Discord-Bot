const client = require("../../index");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "guildDelete",
};

client.on("guildDelete", async (guild) => {
  const owner = await guild.members.fetch(guild.ownerId);

  const embed = new EmbedBuilder();
  embed
    .setTitle("Guild Left")
    .setDescription(`I have been removed from a guild!`)
    .addFields(
      { name: "Guild Name", value: guild.name, inline: true },
      { name: "Guild ID", value: guild.id, inline: true },
      { name: "Guild Owner", value: owner.user.tag, inline: true },
      { name: "Guild Owner ID", value: guild.ownerId, inline: true },
      {
        name: "Guild Member Count",
        value: `${guild.memberCount} members`,
        inline: true,
      },
      {
        name: "Bot servers",
        value: `${client.guilds.cache.size} servers`,
        inline: true,
      }
    )
    .setImage(guild.iconURL({ dynamic: true }))
    .setColor("Green")
    .setTimestamp();

  const testGuild = client.guilds.cache.get("713368626190876712");
  const channel = testGuild.channels.cache.get("941788544249266226");

  channel.send({ embeds: [embed] });
});
