# Configuration

Doubt uses two configuration files and environment variables. Both configuration files are `.gitignore`d for security.

## Environment Variables (`.env`)

Copy `.env.example` to `.env` and fill in the values.

### Required Variables

| Variable | Description | Used When |
|----------|-------------|-----------|
| `PRODUCTION` | Set to `true` for production, `false` for development | Always — controls token/client ID selection; see URI caveat below |
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

The `PRODUCTION` flag controls the token and Discord application ID with an explicit string comparison:

```
PRODUCTION=false  →  DEV_TOKEN, DEV_CLIENT_ID
PRODUCTION=true   →  CLIENT_TOKEN, CLIENT_ID
```

Guild IDs have different runtime roles:
```
DEV_GUILD_ID       → regular slash and context-menu registration at ready time
handler.guildId    → developer command deployment, welcome guild check, stat channels
supportServerId    → mirrors GUILD_ID in the template
```

MongoDB URI selection is less strict in `src/example.config.js`: `handler.mongodb.uri` uses `process.env.PRODUCTION` truthiness. Because environment variables are strings, `PRODUCTION=false` still selects `MONGODB_URI` unless you adjust the generated `src/config.js`. Verify the final `handler.mongodb.uri` value before running the bot locally.

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

#### `handler.guildId`
Selected from `GUILD_ID` or `DEV_GUILD_ID` by the template and used by developer-command deployment plus guild-scoped features such as welcome events and 30-minute stat channel updates. Regular slash commands and context menus are registered on `process.env.DEV_GUILD_ID` by `src/events/ready/registerCommands.js` and `src/events/ready/registerContextMenus.js`.

#### `handler.mongodb.toggle`
Set to `false` to skip the database connection entirely. The bot will start but all database-dependent features (economy, AFK, tickets, etc.) will fail.

#### `variables.channels.botGuilds` / `botUsers`
The bot renames these channels every 30 minutes to display current guild and user counts. If these IDs are empty or invalid, the bot will log non-fatal errors periodically. Set to valid voice channel IDs in your support guild, or leave empty and ignore the errors.

### Per-Guild Prefix

Each guild can set a custom prefix with `?prefix set <new_prefix>`. Custom prefixes are stored in the `guildschemas` MongoDB collection. If no custom prefix is set, the default from `handler.prefix` is used.
