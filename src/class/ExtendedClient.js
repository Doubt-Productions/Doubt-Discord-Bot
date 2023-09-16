const {
  Client,
  Partials,
  Collection,
  GatewayIntentBits,
  ActivityType,
} = require("discord.js");
const config = require("../config");
const commands = require("../handlers/commands");
const events = require("../handlers/events");
const deploy = require("../handlers/deploy");
const mongoose = require("../handlers/mongoose");
const components = require("../handlers/components");
const pjson = require("../../package.json");
const { log } = require("../functions");

module.exports = class extends Client {
  collection = {
    interactioncommands: new Collection(),
    prefixcommands: new Collection(),
    developercommands: new Collection(),
    aliases: new Collection(),
    version: pjson.version,
    components: {
      buttons: new Collection(),
      selects: new Collection(),
      modals: new Collection(),
    },
  };
  applicationcommandsArray = [];
  developerCommandsArray = [];

  constructor() {
    super({
      intents: [Object.keys(GatewayIntentBits)],
      partials: [Object.keys(Partials)],
      presence: {
        activities: [
          {
            name: "/help",
            type: ActivityType.Watching,
          },
        ],
      },
    });
  }

  start = async () => {
    commands(this);
    events(this);
    components(this);
    if (config.handler.mongodb.toggle) mongoose();

    console.log();

    await this.login(process.env.CLIENT_TOKEN || config.client.token);

    setInterval(async () => {
      const guilds = await this.guilds.fetch({});
      const users = this.guilds.cache.reduce(
        (acc, guild) => acc + guild.memberCount,
        0
      );

      log(`Bot Guilds: ${guilds.size}`, "info");
      log(`Bot Users: ${users}`, "info");
      this.guilds.cache
        .get(config.handler.guildId)
        .channels.edit(config.variables.channels.botGuilds, {
          name: `Bot Guilds | ${guilds.size}`,
        });
      this.guilds.cache
        .get(config.handler.guildId)
        .channels.edit(config.variables.channels.botUsers, {
          name: `Bot Users | ${users}`,
        });
    }, 1000 * 60 * 30);

    if (config.handler.deploy) deploy(this, config);
  };
};
