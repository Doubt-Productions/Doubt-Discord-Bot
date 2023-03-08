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
const SoftUI = require("dbd-soft-ui");
const DBD = require("discord-dashboard");
const MongoStore = require("connect-mongo");
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

// Top.GG API
const { AutoPoster } = require("topgg-autoposter");

const ap = AutoPoster(config.Client.TOPGG_TOKEN, client);

ap.on("posted", () => {
  console.log("Posted stats to Top.gg!");
});

// Handle errors:
process.on("unhandledRejection", async (err, promise) => {
  console.error(`[ANTI-CRASH] Unhandled Rejection: ${err}`.red);
  console.error(promise);
});

(async () => {
  await DBD.useLicense(config.dbd.license);
  DBD.Dashboard = DBD.UpdatedClass();

  const Dashboard = new DBD.Dashboard({
    sessionStorage: MongoStore.create({
      mongoUrl: config.Handlers.MONGO,
      collection: "sessions",
      databaseName: "dbd",
    }),
    port: config.dbd.port,
    client: config.discord.client,
    redirectUri: `${config.dbd.domain}${config.dbd.redirectUri}`,
    domain: config.dbd.domain,
    ownerIDs: config.dbd.ownerIDs,
    useThemeMaintenance: true,
    useTheme404: true,
    bot: client,
    acceptPrivacyPolicy: true,
    useUnderMaintenance: true,
    useThemeMaintenance: true,
    useTheme404: true,
    requiredPermissions: [DBD.DISCORD_FLAGS.Permissions.MANAGE_GUILD],
    underMaintenance: {
      title: "Under Maintenance",
      contentTitle: "This page is under maintenance",
      texts: [
        "We still want to change for the better for you.",
        "Therefore, we are introducing technical updates so that we can allow you to enjoy the quality of our services.",
        "Come back to us later or join our Discord Support Server",
      ],

      // "Must contain 3 cards. All fields are optional - If card not wanted on maintenance page, infoCards can be deleted",
      infoCards: [
        {
          title: "100+",
          subtitle: "Over 100 commands!",
          description: "Look at our commands during our downtime",
        },
        {
          title: "500",
          subtitle: "Text",
          description: "Description here!",
        },
        {
          title: "!",
          subtitle: "Warning",
          description: "Do you even have permission to be here?",
        },
      ],
    },
    theme: SoftUI({
      customThemeOptions: {
        index: async ({ req, res, config }) => {
          return {
            values: [],
            graph: {},
            cards: [],
          };
        },
      },
      dbdriver: config.Handlers.MONGO,
      websiteName: "Doubt Bot",
      colorScheme: "pink",
      supporteMail: "contact@doubtbot.tk",
      icons: {
        favicon: "https://links.zvapor.xyz/favicon",
        noGuildIcon:
          "https://pnggrid.com/wp-content/uploads/2021/05/Discord-Logo-Circle-1024x1024.png",
        sidebar: {
          darkUrl: "https://links.zvapor.xyz/doubt",
          lightUrl: "https://links.zvapor.xyz/doubt",
          hideName: true,
          borderRadius: false,
          alignCenter: true,
        },
      },
      index: {
        card: {
          category: "Onboarding",
          title: "Doubt bot - The bot everyone needs",
          description:
            "You can learn more by clicking the link below <b><i>Invite me using the link below!</i></b>",
          image: "https://links.zvapor.xyz/doubt",
          link: {
            enabled: true,
            url: "https://top.gg/bot/941052587837378570",
          },
        },
        graph: {
          enabled: true,
          lineGraph: false,
          title: "Server Count",
          tag: "Servers",
          max: 150,
        },
      },
      sweetalert: {
        errors: {},
        success: {
          login: "Successfully logged in.",
        },
      },
      preloader: {
        image: "https://links.zvapor.xyz/doubt",
        spinner: true,
        text: "Page is loading",
      },
      admin: {
        pterodactyl: {
          enabled: true,
          apiKey: config.dbd.ptero_api,
          panelLink: "https://panel.zvapor.xyz",
          serverUUIDs: ["cbde8f91-18d8-44be-91c9-667411e02060"],
        },
      },
      commands: [],
    }),
    settings: [],
  });
  Dashboard.init();
})();

client.login(AuthenticationToken);
