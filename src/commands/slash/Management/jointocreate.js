const { ChatInputCommandInteraction, SlashCommandBuilder,PermissionFlagsBits, ChannelType } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const schema = require('../../../schemas/join-to-create')

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('setup-jointocreate')
        .setDescription('Setup the join to create system!')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addChannelOption(option => option.setName('channel').setDescription('The channel where the join to create system will be created!').setRequired(true).addChannelTypes(ChannelType.GuildVoice))
        .addNumberOption(option => option.setName('userlimit').setDescription('The user limit of the join to create system!').setRequired(true).setMinValue(1).setMaxValue(99)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {
        const {guild, options } = interaction
        const channel = options.getChannel('channel')
        const userLimit = options.getNumber('userlimit')

        let data = await schema.findOne({ Guild: guild.id })
        if (!data) {
            data = new schema({
                Guild: interaction.guild.id,
                Channel: channel.id,
                UserLimit: userLimit
            })

            await data.save()

            interaction.reply({ content: 'The join to create system has been setup!', ephemeral: true })

        } else {
            data.Channel = channel.id
            data.UserLimit = userLimit

            await data.save()

            interaction.reply({ content: `Updated the data!`, ephemeral: true})
        }
    }
};
