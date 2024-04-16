module.exports = {
    client: {
      token: process.env.DEV_TOKEN,
      id: process.env.DEV_CLIENT_ID,
    },
    variables: {
      channels: {
        logs: "941788544249266226",
        botGuilds: process.env.PRODUCTION === true
          ? "1152709501418471517"
          : "1152001404353904733",
        botUsers: process.env.PRODUCTION === true
          ? "1152709537812447362"
          : "1152001401904439367",
      },
      dbName: "development",
      supportServerId: process.env.GUILD_ID,
    },
    moderation: {
      developers: ["501700626690998280"],
      staffRoles: ["724605829235605574", "1120784461685084275"],
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
        uri: process.env.DEV_MONGODB_URI,
        toggle: true,
      },
    },
  };
  