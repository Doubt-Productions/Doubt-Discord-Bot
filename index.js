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
        favicon:
          "https://assistantscenter.com/wp-content/uploads/2021/11/cropped-cropped-logov6.png",
        noGuildIcon:
          "https://pnggrid.com/wp-content/uploads/2021/05/Discord-Logo-Circle-1024x1024.png",
        sidebar: {
          darkUrl: "https://assistantscenter.com/img/logo.png",
          lightUrl: "https://assistanscenter.com/img/logo.png",
          hideName: true,
          borderRadius: false,
          alignCenter: true,
        },
      },
      index: {
        card: {
          category: "Soft UI",
          title: "Assistants - The center of everything",
          description:
            "Assistants Discord Bot management panel. <b><i>Feel free to use HTML</i></b>",
          image: "/img/soft-ui.webp",
          link: {
            enabled: true,
            url: "https://google.com",
          },
        },
        graph: {
          enabled: true,
          lineGraph: false,
          title: "Memory Usage",
          tag: "Memory (MB)",
          max: 100,
        },
      },
      sweetalert: {
        errors: {},
        success: {
          login: "Successfully logged in.",
        },
      },
      preloader: {
        image: "/img/soft-ui.webp",
        spinner: false,
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
