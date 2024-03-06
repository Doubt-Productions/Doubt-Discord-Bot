const { Message, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config');
const GuildSchema = require('../../../schemas/GuildSchema');

module.exports = {
    data: {
        name: 'help',
        description: 'View all the possible commands!',
        aliases: ['h']
    },
    /**
     * @param {ExtendedClient} client 
     * @param {Message} message 
     * @param {[String]} args 
     */
    run: async (client, message, args) => {

        let prefix = config.handler.prefix;

        if (config.handler?.mongodb?.toggle) {
            try {
                const data = (await GuildSchema.findOne({ guild: message.guildId }));

                if (data && data?.prefix) prefix = data.prefix;
            } catch {
                prefix = config.handler.prefix;
            };
        };

        const mapIntCmds = client.applicationcommandsArray.map((v) => `\`/${v.name}\`: ${v.description || '(No description)'}`);
        const mapPreCmds = client.collection.prefixcommands.map((v) => `\`${prefix}${v.data.name}\` (${v.data.aliases.length > 0 ? v.data.aliases.map((a) => `**${a}**`).join(', ') : 'None'}): ${v.data.description || '(No description)'}`);

        await message.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Help command')
                    .addFields(
                        { name: 'Slash commands', value: `${mapIntCmds.join('\n')}` },
                        { name: 'Prefix commands', value: `${mapPreCmds.join('\n')}` }
                    )
            ]
        });

    }
};
