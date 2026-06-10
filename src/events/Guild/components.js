const ExtendedClient = require('../../class/ExtendedClient');

module.exports = {
    event: 'interactionCreate',
    /**
     * Button/select/modal execution lives in src/events/validations/.
     * This module intentionally does not run components — registering both
     * this handler and the validator chain caused every component to run twice.
     *
     * @param {ExtendedClient} client
     * @param {import('discord.js').Interaction} interaction
     */
    run: async (_client, _interaction) => {},
};
