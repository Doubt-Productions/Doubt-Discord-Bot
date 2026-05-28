# Configuration

Doubt uses two configuration files and environment variables. Both configuration files are `.gitignore`d for security.

## Environment Variables (`.env`)

Copy `.env.example` to `.env` and fill in the values.

### Required Variables

| Variable | Description | Used When |
|----------|-------------|-----------|
| `PRODUCTION` | Set to `true` for production, `false` for development | Always — controls which token/ID/URI set is used |
| `DEV_TOKEN` | Discord bot token for development | `PRODUCTION=false` |
| `DEV_CLIENT_ID` | Discord application ID for development | `PRODUCTION=false` |
| `DEV_GUILD_ID` | Guild ID for slash command registration | Always |
| `DEV_MONGODB_URI` | MongoDB connection string for development | `PRODUCTION=false` |

### Production Variables

| Variable | Description |
|----------|-------------|
| `CLIENT_TOKEN` | Discord bot token for production |
| `CLIENT_ID` | Discord application ID for production |
| `GUILD_ID` | Support/production guild ID |
| `MONGODB_URI` | MongoDB connection string for production |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MongoDB URI for Prisma CLI tools (`prisma db push`, etc.). Not used at runtime. |
| `TOPGG_TOKEN` | [Top.gg](https://top.gg/) API token for automatic stat posting |

### Production Toggle Behavior

The `PRODUCTION` flag controls which set of credentials the bot uses:

```
PRODUCTION=false  →  DEV_TOKEN, DEV_CLIENT_ID, DEV_MONGODB_URI
PRODUCTION=true   →  CLIENT_TOKEN, CLIENT_ID, MONGODB_URI
```

Implementation detail: token and client ID selection compare `PRODUCTION` to the string `"true"`, but MongoDB URI selection uses JavaScript truthiness. If `.env` contains `PRODUCTION=false`, that non-empty string still selects `MONGODB_URI` for `handler.mongodb.uri`. Verify generated `src/config.js` before running locally.

The guild ID for command registration:
```
Ready-time slash commands       →  DEV_GUILD_ID
Ready-time context menu commands →  DEV_GUILD_ID
Developer command deployment     →  config.handler.guildId
```

`GUILD_ID` is still used as `variables.supportServerId` and as the default `handler.guildId` value in `src/example.config.js`, but the ready-time slash/context-menu registration files read `DEV_GUILD_ID` directly.

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
    staffRoles: [""],    // Array of role IDs for staff commands
  },
  handler: {
    prefix: "?",         // Default prefix for prefix commands
    deploy: true,        // (unused by current code)
    guildDeploy: true,   // (unused by current code)
    guildId: "",         // Guild for developer command deployment
    commands: {
      prefix: false,     // Enable/disable prefix commands
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
Array of Discord user ID strings. Users listed here can use developer-only slash and prefix commands (`/eval`, `/deploy`, `/badge`, `?eval`, etc.). The validators normalize this field with `src/utils/normalizeIdAllowlist.js`; if it is missing or accidentally configured as a single string instead of an array, developer-only commands are denied with a configuration error instead of doing string substring checks.

#### `moderation.staffRoles`
Array of Discord role ID strings. Members with any of these roles can use staff-only developer commands. Like developer IDs, this must be an array; malformed values normalize to an empty list.

#### `handler.commands.prefix`
Set to `true` to enable prefix commands (`?help`, `?ping`, etc.). Disabled by default.

#### `handler.commands.slash` / `user` / `message`
These toggles are checked by the backup Guild interaction router in `src/events/Guild/interactionCreate.js`. The primary validator pipeline in `src/events/validations/**` loads matching commands and context menus from disk and does not currently read these flags, so do not rely on them as a global disable switch for slash or context menu interactions.

#### `handler.mongodb.toggle`
Set to `false` to skip the database connection entirely. The bot will start but all database-dependent features (economy, AFK, tickets, etc.) will fail.

#### `variables.channels.botGuilds` / `botUsers`
The bot renames these channels every 30 minutes to display current guild and user counts. If these IDs are empty or invalid, the bot will log non-fatal errors periodically. Set to valid voice channel IDs in your support guild, or leave empty and ignore the errors.

### Per-Guild Prefix

Each guild can set a custom prefix with `?prefix set <new_prefix>`. Custom prefixes are stored in the `guildschemas` MongoDB collection. If no custom prefix is set, the default from `handler.prefix` is used.

### Message Text Configuration

`src/messageConfig.json` stores reusable embed colors and validation error strings used by the interaction validators, such as developer-only, test-mode, user-permission, bot-permission, button, and select-menu errors. The file contains a `commandPremiumOnly` message, but no current validator enforces premium-only commands.
