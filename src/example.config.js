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
      logs: "",
      botGuilds: process.env.PRODUCTION === true
        ? ""
        : "",
      botUsers: process.env.PRODUCTION === true
        ? ""
        : "",
    },
    dbName: process.env.PRODUCTION ? "production" : "development",
    supportServerId: process.env.GUILD_ID,
  },
  moderation: {
    developers: [""],
    staffRoles: ["", ""],
  },
  handler: {
    prefix: "?",
    deploy: true,
    guildDeploy: true,
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
      uri: process.env.PRODUCTION
        ? process.env.MONGODB_URI
        : process.env.DEV_MONGODB_URI,
      toggle: true,
    },
  },
};
