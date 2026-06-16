# Configuration

Doubt uses two configuration files and environment variables. Both configuration files are `.gitignore`d for security.

## Environment Variables (`.env`)

Copy `.env.example` to `.env` and fill in the values.

### Required Variables

| Variable | Description | Used When |
|----------|-------------|-----------|
| `PRODUCTION` | Set to `true` for production. Leave unset or empty for local development unless you have reviewed `src/config.js`. | Always — controls which token/ID/URI set is used |
| `DEV_TOKEN` | Discord bot token for development | `PRODUCTION` is not `"true"` |
| `DEV_CLIENT_ID` | Discord application ID for development | `PRODUCTION` is not `"true"` |
| `DEV_GUILD_ID` | Guild ID for ready-time slash/context-menu registration | Always |
| `DEV_MONGODB_URI` | MongoDB connection string for development | `PRODUCTION` is unset or empty in the generated config |

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

The generated `src/example.config.js` does not handle every field the same way. Token, client ID, and `handler.guildId` compare `PRODUCTION` to the string `"true"`:

```
PRODUCTION unset/empty/false  →  DEV_TOKEN, DEV_CLIENT_ID, DEV_GUILD_ID
PRODUCTION=true               →  CLIENT_TOKEN, CLIENT_ID, GUILD_ID
```

MongoDB URI and `variables.dbName` use JavaScript truthiness instead:

```
PRODUCTION unset/empty  →  DEV_MONGODB_URI, development
PRODUCTION=false        →  MONGODB_URI, production
PRODUCTION=true         →  MONGODB_URI, production
```

For local development, prefer leaving `PRODUCTION` unset or empty. A literal `PRODUCTION=false` string still selects `MONGODB_URI` for runtime Prisma connections unless you edit the generated `src/config.js`.

Command registration uses two guild IDs:

- Ready-time slash commands and context menus always use `DEV_GUILD_ID`.
- Developer commands use `config.handler.guildId`, which resolves to `DEV_GUILD_ID` unless `PRODUCTION === "true"`, then `GUILD_ID`.

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
