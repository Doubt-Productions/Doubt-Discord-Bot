# Configuration

Doubt uses two configuration files and environment variables. Both configuration files are `.gitignore`d for security.

## Environment Variables (`.env`)

Copy `.env.example` to `.env` and fill in the values.

`src/index.js` loads `.env` once with `require("dotenv").config()` before it
requires the Discord client or runtime configuration. The npm scripts run that
entry point directly, so they do not need the `dotenv` CLI. If you execute a
module directly for ad-hoc debugging, export the same variables in your shell or
preload dotenv yourself.

### Required Variables

| Variable | Description | Used When |
|----------|-------------|-----------|
| `PRODUCTION` | Set to the exact string `true` for production. Leave unset or set any other value, such as `false`, for development. | Always — controls which token/ID/URI set is used |
| `DEV_TOKEN` | Discord bot token for development | `PRODUCTION` is not exactly `true` |
| `DEV_CLIENT_ID` | Discord application ID for development | `PRODUCTION` is not exactly `true` |
| `DEV_GUILD_ID` | Development guild ID. Ready-time slash/context menu registration always reads this value. | Always |
| `DEV_MONGODB_URI` | MongoDB connection string for development | `PRODUCTION` is not exactly `true` |

### Production Variables

| Variable | Description |
|----------|-------------|
| `CLIENT_TOKEN` | Discord bot token for production (`PRODUCTION=true`) |
| `CLIENT_ID` | Discord application ID for production (`PRODUCTION=true`) |
| `GUILD_ID` | Support/production guild ID (`PRODUCTION=true` for `config.handler.guildId`) |
| `MONGODB_URI` | MongoDB connection string for production (`PRODUCTION=true`) |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MongoDB URI for Prisma CLI tools (`prisma db push`, etc.). At runtime `src/handlers/prisma.js` overwrites it with the resolved MongoDB URI before creating the Prisma client. |
| `TOPGG_TOKEN` | [Top.gg](https://top.gg/) API token for automatic stat posting |

### Production Toggle Behavior

The code compares `process.env.PRODUCTION` to the exact lowercase string
`"true"` in `src/example.config.js` and `src/handlers/prisma.js`. Only that
value selects production credentials, guild ID, database name, and MongoDB URI.
Values such as `false`, `TRUE`, `1`, an empty string, or an unset variable all
use the development set.

```
PRODUCTION=false  ->  DEV_TOKEN, DEV_CLIENT_ID, DEV_MONGODB_URI
PRODUCTION=true   ->  CLIENT_TOKEN, CLIENT_ID, MONGODB_URI
```

The runtime guild ID in `config.handler.guildId` follows the same toggle:
```
PRODUCTION=false  ->  DEV_GUILD_ID
PRODUCTION=true   ->  GUILD_ID
```

Ready-time slash command and context menu registration is separate: both
`src/events/ready/registerCommands.js` and
`src/events/ready/registerContextMenus.js` read `DEV_GUILD_ID` directly, even in
production mode.

---

## Runtime Configuration (`src/config.js`)

Copy `src/example.config.js` to `src/config.js` and customize.

### Structure

```js
module.exports = {
  client: {
    token: "...",   // Auto-selected based on PRODUCTION
    id: "...",      // Auto-selected based on PRODUCTION
  },
  variables: {
    channels: {
      logs: "",          // Channel ID for error logging
      botGuilds: "",     // Voice channel renamed to show guild count
      botUsers: "",      // Voice channel renamed to show user count
    },
    dbName: "...",       // "production" or "development" (auto-set)
    supportServerId: "", // GUILD_ID value
  },
  moderation: {
    developers: [""],    // Array of user IDs with developer access
  },
  handler: {
    deploy: true,        // (unused by current code)
    guildDeploy: true,   // (unused by current code)
    guildId: "",         // Guild for developer command deployment
    commands: {
      slash: true,       // Enable/disable slash commands
      user: true,        // Enable/disable user context menus
      message: true,     // Enable/disable message context menus
    },
    mongodb: {
      uri: "",           // Auto-selected MongoDB URI
      toggle: true,      // Enable/disable database connection
    },
  },
};
```

### Key Configuration Notes

#### `moderation.developers`
Array of Discord user ID strings. Users listed here can use developer-only commands (`/eval`, `/deploy`, `/badge`, etc.). If this array is empty or missing, all developer commands are blocked with a configuration error message.

#### Global bot staff
Cross-guild bot staff is stored in Mongo (`BotStaff` collection) and managed with `/botstaff`. Staff-only commands check that ACL (developers are always allowed). The `bot-staff` badge is a public display mark only.

**Cutover:** If you still have `moderation.staffRoles` in your private `config.js`, run `/botstaff migrate` once while `BotStaff` is empty to import those members before removing the key. Otherwise add each person with `/botstaff add` before deploy. Re-runs are refused once `BotStaff` has entries unless you pass `force: true`; bots and users removed with `/botstaff remove` are always skipped.

#### `handler.mongodb.toggle`
Set to `false` to skip the database connection entirely. The bot will start but all database-dependent features (economy, AFK, tickets, etc.) will fail.

#### `variables.channels.botGuilds` / `botUsers`
The bot renames these channels every 30 minutes to display current guild and user counts. If these IDs are empty or invalid, the bot will log non-fatal errors periodically. Set to valid voice channel IDs in your support guild, or leave empty and ignore the errors.

