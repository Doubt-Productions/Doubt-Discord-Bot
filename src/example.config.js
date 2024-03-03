module.exports = {
  client: {
    token: process.env.PRODUCTION === true
      ? process.env.CLIENT_TOKEN
      : process.env.DEV_TOKEN,
    id: process.env.PRODUCTION === true
      ? process.env.CLIENT_ID
      : process.env.DEV_CLIENT_ID,
  },
  variables: {
    channels: {
      logs: "941788544249266226",
      botGuilds: process.env.PRODUCTION === true
        ? "1152001404353904733"
        : "1152709501418471517",
      botUsers: process.env.PRODUCTION === true
        ? "1152001401904439367"
        : "1152709537812447362",
    },
    dbName: process.env.PRODUCTION === true ? "production" : "development",
    supportServerId: process.env.GUILD_ID,
  },
  moderation: {
    developers: ["501700626690998280"],
    staffRoles: ["724605829235605574", "1120784461685084275"],
  },
  handler: {
    prefix: "?",
    deploy: true,
    guildDeploy: process.env.PRODUCTION === true ? false : true,
    guildId: process.env.PRODUCTION === true
      ? process.env.GUILD_ID
      : process.env.DEV_GUILD_ID,
    commands: {
      prefix: false,
      slash: true,
      user: true,
      message: true,
    },
    mongodb: {
      uri: process.env.PRODUCTION === true
        ? process.env.MONGODB_URI
        : process.env.DEV_MONGODB_URI,
      toggle: true,
    },
  },
};
