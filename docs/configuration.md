# Configuration

Doubt uses two configuration files and environment variables. Both configuration files are `.gitignore`d for security.

## Environment Variables (`.env`)

Copy `.env.example` to `.env` and fill in the values.

### Required Variables

| Variable | Description | Used When |
|----------|-------------|-----------|
| `PRODUCTION` | Set to `true` for production. For development, leave unset/empty or read the truthiness warning below before using `false`. | Always — controls which token/ID/URI set is selected by `src/config.js` |
| `DEV_TOKEN` | Discord bot token for development | `PRODUCTION=false` |
| `DEV_CLIENT_ID` | Discord application ID for development | `PRODUCTION=false` |
| `DEV_GUILD_ID` | Guild ID for slash command registration | Always |
| `DEV_MONGODB_URI` | MongoDB connection string for development | Runtime only when `PRODUCTION` is unset/empty; Prisma CLI when `DATABASE_URL` points to it |

### Production Variables

| Variable | Description |
|----------|-------------|
| `CLIENT_TOKEN` | Discord bot token for production |
| `CLIENT_ID` | Discord application ID for production |
| `GUILD_ID` | Support/production guild ID |
| `MONGODB_URI` | MongoDB connection string for production, or any runtime config where `PRODUCTION` is a non-empty string |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MongoDB URI for Prisma CLI tools (`prisma db push`, etc.). Not used at runtime. |
| `TOPGG_TOKEN` | [Top.gg](https://top.gg/) API token for automatic stat posting |

### Production Toggle Behavior

`src/example.config.js` does not treat every value the same way. Token, client ID, and `handler.guildId` use exact string comparison with `"true"`, while the MongoDB URI and `variables.dbName` use JavaScript truthiness.

| Config value | Selection logic | Development result when unset/empty | Result when `PRODUCTION=false` string is present | Production result when `PRODUCTION=true` |
|--------------|-----------------|-------------------------------------|--------------------------------------------------|-----------------------------------------|
| `client.token` | `PRODUCTION === "true"` | `DEV_TOKEN` | `DEV_TOKEN` | `CLIENT_TOKEN` |
| `client.id` | `PRODUCTION === "true"` | `DEV_CLIENT_ID` | `DEV_CLIENT_ID` | `CLIENT_ID` |
| `handler.guildId` | `PRODUCTION === "true"` | `DEV_GUILD_ID` | `DEV_GUILD_ID` | `GUILD_ID` |
| `handler.mongodb.uri` | truthy `PRODUCTION` | `DEV_MONGODB_URI` | `MONGODB_URI` | `MONGODB_URI` |
| `variables.dbName` | truthy `PRODUCTION` | `development` | `production` | `production` |

For local development, either leave `PRODUCTION` unset/empty so the runtime MongoDB URI selects `DEV_MONGODB_URI`, or set `MONGODB_URI` to a safe development database as well. The literal string `PRODUCTION=false` still counts as truthy for the MongoDB URI.

Command registration uses two guild settings:

| Codepath | Guild source | Notes |
|----------|--------------|-------|
| Ready-time slash command registration | `DEV_GUILD_ID` | `src/events/ready/registerCommands.js` always reads `process.env.DEV_GUILD_ID`. |
| Ready-time context menu registration | `DEV_GUILD_ID` | `src/events/ready/registerContextMenus.js` always reads `process.env.DEV_GUILD_ID`. |
| Developer command deployment | `config.handler.guildId` | `src/handlers/deploy.js` deploys `src/commands/devOnly/**` to this guild. |
| Welcome/stat-channel runtime features | `config.handler.guildId` | Several guild-scoped runtime checks use this support/dev guild ID. |

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
