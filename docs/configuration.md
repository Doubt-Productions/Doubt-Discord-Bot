# Configuration

Doubt uses two configuration files and environment variables. Both configuration files are `.gitignore`d for security.

## Environment Variables (`.env`)

Copy `.env.example` to `.env` and fill in the values.

### Required Variables

| Variable | Description | Used When |
|----------|-------------|-----------|
| `PRODUCTION` | Set to `true` for production, `false` for development | Always - controls token/client/guild selection; see MongoDB caveat below |
| `DEV_TOKEN` | Discord bot token for development | `PRODUCTION=false` |
| `DEV_CLIENT_ID` | Discord application ID for development | `PRODUCTION=false` |
| `DEV_GUILD_ID` | Guild ID for ready-time slash and context-menu registration | Always |
| `DEV_MONGODB_URI` | MongoDB connection string for development | Runtime only when `PRODUCTION` is unset/empty in the current template |

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

The `PRODUCTION` flag controls most selected credentials with an exact string comparison:

```
PRODUCTION=false  ->  DEV_TOKEN, DEV_CLIENT_ID, DEV_GUILD_ID
PRODUCTION=true   ->  CLIENT_TOKEN, CLIENT_ID, GUILD_ID
```

MongoDB URI selection in `src/example.config.js` is different:

```
PRODUCTION unset/empty  ->  DEV_MONGODB_URI
PRODUCTION=false        ->  MONGODB_URI
PRODUCTION=true         ->  MONGODB_URI
```

That happens because `handler.mongodb.uri` checks `process.env.PRODUCTION` for truthiness instead of comparing to `"true"`. If your `.env` contains `PRODUCTION=false`, verify the generated `src/config.js` before starting the bot or change the URI expression locally.

The guild ID for command deployment is split by code path:

```
Ready-time slash commands      ->  DEV_GUILD_ID
Ready-time context menus       ->  DEV_GUILD_ID
Developer command deployment   ->  config.handler.guildId
```

`config.handler.guildId` comes from `src/example.config.js` and follows the exact `PRODUCTION === "true"` check, so developer commands deploy to `GUILD_ID` only when `PRODUCTION=true`.

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
Array of Discord user ID strings. Users listed here can use developer-only commands (`/eval`, `/deploy`, `/badge`, etc.). If this array is empty or missing, all developer commands are blocked with a configuration error message.

#### `moderation.staffRoles`
Array of Discord role ID strings. Members with any of these roles can use staff-only commands.

#### `handler.commands.prefix`
Set to `true` to enable prefix commands (`?help`, `?ping`, etc.). Disabled by default.

#### `handler.mongodb.toggle`
Set to `false` to skip the database connection entirely. The bot will start but all database-dependent features (economy, AFK, tickets, etc.) will fail.

#### `variables.channels.botGuilds` / `botUsers`
The bot renames these channels every 30 minutes to display current guild and user counts. If these IDs are empty or invalid, the bot will log non-fatal errors periodically. Set to valid voice channel IDs in your support guild, or leave empty and ignore the errors.

### Per-Guild Prefix

Each guild can set a custom prefix with `?prefix set <new_prefix>`. Custom prefixes are stored in the `guildschemas` MongoDB collection. If no custom prefix is set, the default from `handler.prefix` is used.
