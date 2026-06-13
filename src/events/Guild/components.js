const ExtendedClient = require('../../class/ExtendedClient');

module.exports = {
    event: 'interactionCreate',
    /**
     * Buttons, select menus, and modals are validated and executed only by the
     * `src/events/validations/` interactionCreate chain. Running components here
     * as well duplicated execution.
     *
     * @param {ExtendedClient} client
     * @param {import('discord.js').Interaction} interaction
     */
    run: async () => {},
};
