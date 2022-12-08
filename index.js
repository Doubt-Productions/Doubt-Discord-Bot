const {
  Client,
  Partials,
  Collection,
  GatewayIntentBits,
} = require("discord.js");
const config = require("./config/config.json");
const colors = require("colors");
const distube = require("distube");
const bfd = require("bfd-api-redux");
const api = new bfd(config.Client.API_TOKEN, config.Client.ID);
const ms = require("ms");

// Creating a new client:
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageTyping,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
    Partials.Reaction,
  ],
  presence: {
    activities: [
      {
        name: "Maintenance",
        type: 0,
      },
    ],
    status: "dnd",
  },
});

// Getting the bot token:
const AuthenticationToken = process.env.TOKEN || config.Client.TOKEN;
if (!AuthenticationToken) {
  console.warn(
    "[CRASH] Authentication Token for Discord bot is required! Use Envrionment Secrets or config.json."
      .red + "\n"
  );
  return process.exit();
}

// Logging System
const logs = require("discord-logs");
logs(client, {
  debug: true,
});

// Bot Users & Guilds:

setTimeout(() => {
  const botUsers = client.guilds.cache.reduce(
    (acc, guild) => acc + guild.memberCount,
    0
  );
  const botGuilds = client.guilds.cache.size;

  const guild = client.guilds.cache.get("833675115408523264");

  const userChannel = guild.channels.cache.get("1050534250736259163");
  const guildChannel = guild.channels.cache.get("1050535065232343060");

  userChannel.edit({ name: `Bot Users: | ${botUsers}` });
  guildChannel.edit({ name: `Bot Guilds: | ${botGuilds}` });
  console.log(`[BOT] Bot Users: ${botUsers} | Bot Guilds: ${botGuilds}`.green);
}, 600000);

// Discords.com API
setInterval(() => {
  let serverCount = client.guilds.cache.size;
  api.setServers(serverCount);
  console.log(`[API] Updated server count to ${serverCount}`.green);
}, parseInt(ms("2h")));

// Handler:
client.commands = new Collection();
client.commandArray = [];
client.events = new Collection();
client.buttons = new Collection();
client.menus = new Collection();
client.modals = new Collection();
client.contexts = new Collection();
client.userSettings = new Collection();

module.exports = client;

["slash", "events", "mongoose", "components"].forEach((file) => {
  require(`./Systems/handlers/${file}`)(client);
});

const { handleLogs } = require("./Systems/handlers/handleLogs");
handleLogs(client);

require(`./Systems/handlers/Distube_Events`)(client);

const { DisTube } = distube;
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { YtDlpPlugin } = require("@distube/yt-dlp");

client.DisTube = new DisTube(client, {
  leaveOnStop: true,
  emitNewSongOnly: true,
  emitAddSongWhenCreatingQueue: false,
  emitAddListWhenCreatingQueue: false,
  leaveOnEmpty: true,
  plugins: [
    new SpotifyPlugin({
      emitEventsAfterFetching: true,
    }),
    new SoundCloudPlugin(),
    new YtDlpPlugin(),
  ],
});

// Handle errors:
process.on("unhandledRejection", async (err, promise) => {
  console.error(`[ANTI-CRASH] Unhandled Rejection: ${err}`.red);
  console.error(promise);
});

client.login(AuthenticationToken);
