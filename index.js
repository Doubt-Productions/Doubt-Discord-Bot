const {
  Client,
  Partials,
  Collection,
  GatewayIntentBits,
} = require("discord.js");
const config = require("./config/config.json");
require("colors");
const distube = require("distube");
const bfd = require("bfd-api-redux");
const api = new bfd(config.Client.API_TOKEN, config.Client.ID);
const ms = require("ms");

// Creating a new client:
const client = new Client({
  intents: [Object.keys(GatewayIntentBits)],
  partials: [Object.keys(Partials)],
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

// Discords.com API
setInterval(() => {
  let serverCount = client.guilds.cache.size;
  api.setServers(serverCount);
  //   console.log(`[API] Updated server count to ${serverCount}`.green);
}, parseInt(ms("10m")));

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
