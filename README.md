<!--- README -->

<!--- Information -->
<br />
<div align="center">

<a href="https://github.com/Doubt-Productions/Doubt-Discord-Bot">
  <img src="https://github.com/Doubt-Productions/Assets/blob/main/Doubt%20Logo.jpg" alt="Logo" width="128" height="128" />
</a>

<h3 align="center">Doubt Discord Bot</h3>
<h4 align="center">Made For <a href="https://github.com/Doubt-Productions">Doubt Productions</a><br>By <a href="https://github.com/zVapor-Dev">zVapor-Dev</a> (Vapor)</h4>

A multi-purpose bot with lots of features!<br/>
This project is currently a WIP!

</div>

<!--- Credits -->
## ℹ️ Credits
```md
- zVapor-Dev (Vapor) (General data + Commands beloning to init commit)
```

`IF YOU ADD SOMETHING TO THE REPO ADD YOURSELF TO THE CREDITS!`

<!--- Installation -->
## 🔌 Installation
```sh
npm install
cp .env.example .env
cp src/example.config.js src/config.js
npm run dev
```

The bot expects two ignored local files:

- `.env` stores Discord, MongoDB, guild, and developer credentials.
- `src/config.js` stores bot feature toggles, command settings, role IDs, and channel IDs.

For local development, set the `DEV_*` values in `.env` and point MongoDB at a running server:

```env
DEV_TOKEN=your-discord-bot-token
DEV_CLIENT_ID=your-discord-application-id
DEV_GUILD_ID=your-test-guild-id
DEV_MONGODB_URI=mongodb://127.0.0.1:27017/doubt
```

Keep `CLIENT_TOKEN`, `CLIENT_ID`, `GUILD_ID`, and `MONGODB_URI` for production-style runs. The current config reads `process.env.PRODUCTION` inconsistently, so `PRODUCTION=false` is still treated as enabled by some database settings. For a local dev run, leave `PRODUCTION` unset or blank unless you have verified the selected token, guild, and MongoDB URI.

## 🧭 Runtime Overview

- `src/index.js` loads `.env`, creates `ExtendedClient`, starts the Discord client, and starts the Express uptime server.
- `src/server.js` serves `GET /` on `0.0.0.0:8080` with a simple "Bot is online" response.
- `src/class/ExtendedClient.js` creates Discord collections, loads commands/events/components, connects MongoDB when enabled, logs in, deploys developer commands, and starts the optional Top.gg autoposter when `TOPGG_TOKEN` is set.
- `src/handlers/commands.js` auto-loads command modules from `src/commands/{prefix,slash,devOnly}/<Category>/*.js`.
- `src/handlers/components.js` auto-loads buttons, select menus, and modals from `src/components/<type>/*.js`.
- Ready events in `src/events/ready/` sync slash commands and context menus with the configured development guild.

## 🧩 Module Conventions

Slash and developer commands export `data` and `run`:

```js
module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong!")
    .toJSON(),
  run: async (client, interaction) => {
    await interaction.reply("Pong!");
  },
};
```

Prefix commands export `data.name`, optional `data.aliases`, optional `data.permissions`, and `run`. Prefix commands only execute when `config.handler.commands.prefix` is enabled.

Components export `customId` and `run` from the matching folder:

```js
module.exports = {
  customId: "example-button",
  run: async (client, interaction) => {
    await interaction.reply({ content: "Handled!", ephemeral: true });
  },
};
```

Developer-only slash commands use `options.developers: true`; developer and staff allowlists are configured in `src/config.js`.

## 🧪 Testing

Run the unit tests with:

```sh
npm test
```

The current tests use Node's built-in test runner and do not require Discord, MongoDB, or a running bot process.

## 🛠️ Troubleshooting

- If startup logs a MongoDB connection error, confirm `DEV_MONGODB_URI` or `MONGODB_URI` matches the environment mode actually selected by `src/config.js`.
- If the Discord client does not log in, confirm the selected token is set. `DEV_TOKEN` is used for local development.
- The Express health-check can still respond on `http://localhost:8080/` even when Discord login or command loading fails.
- `src/commands/slash/Economy/rob.js` currently has a pre-existing syntax error, which prevents full command loading before `client.login()` is reached.

<!--- Import -->
## 🔗 Import

#### There is no imports for this module.

<!--- Usage -->
## 🔍 Usage

### There is no usage for this module.

