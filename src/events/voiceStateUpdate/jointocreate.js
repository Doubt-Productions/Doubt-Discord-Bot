const {
  ChannelType,
  GuildVoice,
  Collection,
  PermissionFlagsBits,
} = require("discord.js");
const config = require("../../config");
const { log } = require("../../functions");
const schema = require("../../schemas/join-to-create");
const ExtendedClient = require("../../class/ExtendedClient");
const voiceManager = new Collection();

module.exports = /**
 *
 * @param {ExtendedClient} client
 * @param {GuildVoice} oldState
 * @param {GuildVoice} newState
 * @returns
 */ async (client, oldState, newState) => {
  const { member, guild } = oldState;
  const newChannel = newState.channel;
  const oldChannel = oldState.channel;

  const data = await schema.findOne({ Guild: guild.id });
  if (!data) return;

  if (data) {
    const channelId = data.Channel;
    const channel = client.channels.cache.get(channelId);
    const userLimit = data.UserLimit;

    if (
      oldChannel !== newChannel &&
      newChannel &&
      newChannel.id === channel.id
    ) {
      const voiceChannel = await guild.channels.create({
        name: `🔊 | ${member.displayName}`,
        type: ChannelType.GuildVoice,
        parent: newChannel.parent,
        permissionOverwrites: [
          {
            id: guild.id,
            allow: [PermissionFlagsBits.Connect],
          },
          {
            id: member.id,
            allow: [
              PermissionFlagsBits.Connect,
              PermissionFlagsBits.ManageChannels,
            ],
          },
        ],
        userLimit: userLimit,
      });

      voiceManager.set(member.id, voiceChannel.id);

      await newChannel.permissionOverwrites.edit(member.id, {
        Connect: false,
      });
      setTimeout(() => {
        newChannel.permissionOverwrites.delete(member);
      }, 30000);

      return setTimeout(() => {
        member.voice.setChannel(voiceChannel);
      }, 500);
    }

    const jointocreate = voiceManager.get(member.id);
    const members = oldChannel?.members
      .filter((m) => !m.user.bot)
      .map((m) => m.id);

    if (
      jointocreate &&
      oldChannel.id === jointocreate &&
      (!newChannel || newChannel.id !== jointocreate)
    ) {
      if (member.length > 0) {
        letRandomID = members[Math.floor(Math.random() * members.length)];
        let randomMember = guild.members.cache.get(letRandomID);
        randomMember.voice.setChannel(oldChannel).then((v) => {
          oldChannel
            .setName(randomMember.displayName)
            .catch((err) => console.log(err));
          oldChannel.permissionOverwrites.edit(randomMember.id, {
            Connect: true,
            ManageChannels: true,
          });
        });
        voiceManager.set(member.id, null);
        voiceManager.set(randomMember.id, oldChannel.id);
      } else {
        voiceManager.set(member.id, null);
        oldChannel.delete().catch((err) => console.log(err));
      }
    }
  }
};
