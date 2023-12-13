module.exports = {
  client: {
    token: process.env.CLIENT_TOKEN,
    id: process.env.CLIENT_ID,
  },
  variables: {
    channels: {
      logs: "",
    },
    dbName: "",
    supportServerId: "",
  },
  moderation: {
    admins: [""],
    developers: [""],
    moderators: [],
    support: [],
  },
  handler: {
    prefix: "?",
    deploy: true,
    guildDeploy: true,
    guildId: "",
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
