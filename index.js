const {
  Client,
  Partials,
  Collection,
  GatewayIntentBits,
} = require("discord.js");
const config = require("./config/config.json");
const colors = require("colors");
const distube = require("distube");

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
