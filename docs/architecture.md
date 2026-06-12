# Architecture

Technical overview of the bot's internal architecture, event pipeline, and module loading system.

## Startup Flow

The entry point is `src/index.js`:

```
1. Load environment variables (dotenv)
2. Create ExtendedClient instance
3. client.start() (async, not awaited)
   ├── Load commands (src/handlers/commands.js)
   ├── Load events (src/handlers/events.js)
   ├── Load components (src/handlers/components.js)
   ├── Connect to MongoDB via Prisma (if handler.mongodb.toggle)
   ├── Login to Discord (client.login)
   ├── Deploy developer commands (src/handlers/deploy.js)
   ├── Start Top.gg autoposter (if TOPGG_TOKEN set)
   └── Start 30-minute stat channel update interval
4. Start Express health-check server (port 8080)
5. Register global error handlers (unhandledRejection, uncaughtException)
```

Since `client.start()` is not awaited, the Express server starts concurrently with Discord login.

## Command Loading

### Slash Commands (`src/commands/slash/`)

Loaded by `src/handlers/commands.js`. Files are organized in category subdirectories:

```
commands/slash/
├── Economy/     (bal, beg, deposit, economy, rob, withdraw)
├── General/     (afk, rank, test)
├── Info/        (botinfo, help, serverinfo, userinfo)
├── Management/  (setup)
├── moderation/  (automod, ban, kick, timeout, unban)
└── Utility/     (embedcreator, ping)
```

Each command exports `{ data, run }`:
- `data` — `SlashCommandBuilder` output (`.toJSON()`)
- `run(client, interaction)` — async command handler

Commands are stored in `client.collection.interactioncommands` and `client.applicationcommandsArray`.

### Developer Commands (`src/commands/devOnly/`)

Same structure as slash commands but loaded into `client.collection.developercommands`. Deployed to `config.handler.guildId` via REST API (separate from regular slash command registration).

Developer commands may set `options: { developers: true }` to restrict access.

### Prefix Commands (`src/commands/prefix/`)

Export `{ data: { name, description, aliases?, permissions?, developers? }, run }`. Loaded into `client.collection.prefixcommands` with aliases in `client.collection.aliases`.

Only active when `config.handler.commands.prefix` is `true`.

## Event System

### Event Registration (`src/handlers/events.js`)

The event handler scans `src/events/` subdirectories:

| Folder | Registration Strategy |
|--------|----------------------|
| `validations/` | All files registered under `interactionCreate` as a validation chain |
| `ready/` | Files export functions, registered under `ready` event |
| `Guild/` | Files export `{ event, run }` objects, registered under their declared `event` property |

### Interaction Validation Pipeline

When an `interactionCreate` event fires, **all** validators run in sequence:

```
interactionCreate
├── chatInputCommandValidator.js  — slash command validation + execution
├── devCommandValidator.js        — developer command validation + execution
├── buttonValidator.js            — button validation + execution
├── selectMenuValidator.js        — select menu validation + execution
├── ModalCommandValidator.js      — modal validation + execution
└── contextMenuCommandValidator.js — context menu validation + execution
```

Each validator:
1. Checks if the interaction matches its type (e.g., `isChatInputCommand()`)
2. Finds the matching command/component from local files
3. Validates permissions (developer, staff, NSFW, test mode, user/bot perms)
4. Calls `run()` if validation passes

### Guild Event Handlers

These handle non-interaction events:

| File | Event | Purpose |
|------|-------|---------|
| `messageCreate.js` | `messageCreate` | Prefix command routing |
| `afkCheck.js` | `messageCreate` | AFK detection and notifications |
| `guildMemberAdd.js` | `guildMemberAdd` | Welcome messages and auto-roles |
| `jointocreate.js` | `voiceStateUpdate` | Temporary voice channel management |
| `interactionCreate.js` | `interactionCreate` | Backup slash command router (skips if already handled) |
| `components.js` | `interactionCreate` | Backup component router (skips if already handled) |

The Guild `interactionCreate.js` and `components.js` files include guards (`interaction.replied || interaction.deferred`) to avoid double-executing commands already handled by validators.

## Component System

### Component Loading (`src/handlers/components.js`)

Scans `src/components/` subdirectories:

```
components/
├── buttons/   → client.collection.components.buttons
├── modals/    → client.collection.components.modals
└── selects/   → client.collection.components.selects
```

Each component exports `{ customId, run }`.

### Component Routing

Components are routed by `customId` matching. Some components are handled by the validator pipeline, while others use inline collectors (e.g., economy buttons `page1`/`page2`, help `help-menu`).

## Context Menus

Files in `src/contextmenus/` export `{ data, run }` where `data` includes `type` (2 for User, 3 for Message). Registered at ready time via `src/events/ready/registerContextMenus.js` on `DEV_GUILD_ID`.

## Command Deployment

Three deployment paths exist:

1. **Slash commands** — `src/events/ready/registerCommands.js` diffs local commands against Discord API and creates/edits/deletes as needed on `DEV_GUILD_ID`
2. **Context menus** — `src/events/ready/registerContextMenus.js` creates missing user/message context menus and deletes menus marked `deleted` on `DEV_GUILD_ID`; it does not edit existing definitions
3. **Developer commands** — `src/handlers/deploy.js` bulk-overwrites guild commands on `config.handler.guildId` using the developer command array

## Database Layer

The database layer uses Prisma v6 with the MongoDB provider. See [Database](database.md) for model details.

```
src/handlers/prisma.js     — PrismaClient singleton + connectPrisma()
src/schemas/*.js           — Thin re-exports of Prisma model delegates
prisma/schema.prisma       — Schema definition
```

The schema files maintain backward-compatible import paths so existing `require("../schemas/EcoSchema")` calls continue to work, but now return Prisma model delegates instead of Mongoose models.

## Express Server

`src/server.js` starts a minimal Express server on `0.0.0.0:8080` that serves a single health-check endpoint at `/`. Returns a plain text message confirming the bot is online.

## Utility Functions

### `src/functions/index.js`

| Function | Description |
|----------|-------------|
| `log(string, style)` | Chalk-colored console output (`info`, `err`, `warn`, `done`) |
| `time(timeMs, style)` | Discord timestamp formatting (`<t:...>`) |
| `embed(title, desc, color, footer, image, thumbnail, channel, interaction)` | Build and send an embed |
| `randomId(length)` | Generate alphanumeric ID |
| `buttonPagination(interaction, pages, time)` | Paginated embed with prev/home/next buttons |
| `topgg(client)` | Top.gg stat auto-posting |

### `src/utils/`

| File | Description |
|------|-------------|
| `getAllFiles.js` | Recursive directory file listing |
| `getApplicationCommands.js` | Fetch guild or global application commands |
| `getLocalCommands.js` | Load slash command modules from filesystem |
| `getLocalDevCommands.js` | Load dev command modules from filesystem |
| `getLocalContextMenus.js` | Load context menu modules from filesystem |
| `getButtons.js` / `getSelects.js` / `getModals.js` | Load component modules |
| `commandComparing.js` | Normalize command data for diff comparison |
| `normalizeIdAllowlist.js` | Ensure ID lists are arrays |
| `buttonPagination.js` | Alternative pagination helper |
| `join-to-create/generateEmbed.js` | JTC status embed builder |
| `join-to-create/generateRow.js` | JTC dashboard button row |
