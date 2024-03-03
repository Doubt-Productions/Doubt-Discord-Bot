module.exports = {
  client: {
    token: process.env.PRODUCTION === true
      ? process.env.DEV_TOKEN
      : process.env.CLIENT_TOKEN,
    id: process.env.PRODUCTION === true
      ? process.env.DEV_CLIENT_ID
      : process.env.CLIENT_ID,
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
    dbName: process.env.PRODUCTION === true ? "development" : "production",
    supportServerId: process.env.GUILD_ID,
  },
  moderation: {
    developers: [""],
    staffRoles: ["", ""],
  },
  handler: {
    prefix: "?",
    deploy: true,
    guildDeploy: process.env.PRODUCTION === true ? true : false,
    guildId: process.env.PRODUCTION === true
      ? process.env.DEV_GUILD_ID
      : process.env.GUILD_ID,
    commands: {
      prefix: false,
      slash: true,
      user: true,
      message: true,
    },
    mongodb: {
      uri: process.env.PRODUCTION === true
        ? process.env.DEV_MONGODB_URI
        : process.env.MONGODB_URI,
      toggle: true,
    },
  },
};
