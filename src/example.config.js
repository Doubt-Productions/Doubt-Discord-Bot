module.exports = {
  client: {
    token: process.env.PRODUCTION
      ? process.env.CLIENT_TOKEN
      : process.env.DEV_TOKEN,
    id: process.env.PRODUCTION
      ? process.env.CLIENT_ID
      : process.env.DEV_CLIENT_ID,
  },
  variables: {
    channels: {
      logs: "",
      botGuilds: process.env.PRODUCTION
        ? ""
        : "",
      botUsers: process.env.PRODUCTION
        ? ""
        : "",
    },
    dbName: process.env.PRODUCTION ? "production" : "development",
    supportServerId: process.env.GUILD_ID,
  },
  moderation: {
    developers: [""],
    staffRoles: [""],
  },
  handler: {
    prefix: "?",
    deploy: true,
    guildDeploy: true,
    guildId: process.env.PRODUCTION
      ? process.env.GUILD_ID
      : process.env.DEV_GUILD_ID,
    commands: {
      prefix: false,
      slash: true,
      user: true,
      message: true,
    },
    api: {
      personal: {
        toggle: true,
        url: "",
        port: "",
      },
    },
    chatgpt: "",
  },
  mongodb: {
    uri: process.env.MONGODB_URI,
    toggle: true,
  },
};
