# Configuration

Doubt uses two configuration files and environment variables. Both configuration files are `.gitignore`d for security.

## Environment Variables (`.env`)

Copy `.env.example` to `.env` and fill in the values.

### Required Variables

| Variable | Description | Used When |
|----------|-------------|-----------|
| `PRODUCTION` | Set to `true` for production; unset or empty is safest for development with the current template | Always — controls several generated `config.js` values |
| `DEV_TOKEN` | Discord bot token for development | `PRODUCTION` is not exactly `"true"` |
| `DEV_CLIENT_ID` | Discord application ID for development | `PRODUCTION` is not exactly `"true"` |
| `DEV_GUILD_ID` | Guild ID for slash command registration | Always |
| `DEV_MONGODB_URI` | MongoDB connection string for development | When the generated MongoDB URI logic resolves to development |

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

`src/example.config.js` does not apply `PRODUCTION` consistently:

```
Token/client ID/guild ID: process.env.PRODUCTION === "true"
MongoDB URI/dbName:       process.env.PRODUCTION truthiness
```

Practical effects:

- `PRODUCTION=true` selects `CLIENT_TOKEN`, `CLIENT_ID`, `GUILD_ID`, and `MONGODB_URI`.
- `PRODUCTION=false` as a string selects `DEV_TOKEN` and `DEV_CLIENT_ID`, but still selects `MONGODB_URI` for `handler.mongodb.uri` because non-empty strings are truthy.
- For development, either leave `PRODUCTION` unset/empty before generating `src/config.js`, or edit `src/config.js` so `handler.mongodb.uri` points at `DEV_MONGODB_URI`.
- `DATABASE_URL` is only for Prisma CLI commands. It does not override the runtime Prisma client, which uses `config.handler.mongodb.uri`.

Guild selection also has multiple paths:

```
Ready-time slash commands:        DEV_GUILD_ID
Ready-time context menu commands: DEV_GUILD_ID
Developer command deployment:     config.handler.guildId
Welcome guildMemberAdd handler:   config.handler.guildId
```

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
Guild ID used by developer command deployment and by support-guild-only runtime features such as welcome messages. This is separate from `DEV_GUILD_ID`, which is used by ready-time slash and context-menu registration.

#### `handler.mongodb.toggle`
Set to `false` to skip the database connection entirely. The bot will start but all database-dependent features (economy, AFK, tickets, etc.) will fail.

#### `variables.channels.botGuilds` / `botUsers`
The bot renames these channels every 30 minutes to display current guild and user counts. If these IDs are empty or invalid, the bot will log non-fatal errors periodically. Set to valid voice channel IDs in your support guild, or leave empty and ignore the errors.

### Per-Guild Prefix

Each guild can set a custom prefix with `?prefix set <new_prefix>`. Custom prefixes are stored in the `guildschemas` MongoDB collection. If no custom prefix is set, the default from `handler.prefix` is used.
