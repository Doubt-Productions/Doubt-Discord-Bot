# Database

Doubt uses **MongoDB** as its database, accessed through **Prisma v6**. The Prisma schema is defined in `prisma/schema.prisma`.

## Connection

The Prisma client is initialized in `src/handlers/prisma.js` as a singleton. It reads the MongoDB URI from `config.handler.mongodb.uri` (which resolves to `DEV_MONGODB_URI` or `MONGODB_URI` based on the `PRODUCTION` flag).

Connection is established during bot startup if `config.handler.mongodb.toggle` is `true`.

## Prisma CLI

For Prisma CLI tools (like `prisma db push` or `prisma studio`), set the `DATABASE_URL` environment variable in `.env` to your MongoDB connection string.

```bash
# Sync indexes to the database
npx prisma db push

# Browse data interactively
npx prisma studio

# Regenerate the client after schema changes
npx prisma generate
```

MongoDB does not support migrations (`prisma migrate` commands will not work).

## Models

### EcoSchema

Economy accounts — one per user per guild.

| Field | Type | Description |
|-------|------|-------------|
| `id` | ObjectId | Auto-generated primary key |
| `Guild` | String? | Discord guild ID |
| `User` | String? | Discord user ID |
| `Bank` | Float? | Bank balance |
| `Wallet` | Float? | Wallet balance |

**Collection:** `ecoschemas`

**Used by:** `/economy`, `/bal`, `/deposit`, `/withdraw`, `/beg`, `/rob`

---

### Users

User configuration and badge assignments.

| Field | Type | Description |
|-------|------|-------------|
| `id` | ObjectId | Auto-generated primary key |
| `user` | String? | Discord user ID |
| `badges` | String[] | Array of badge IDs assigned to this user |

**Collection:** `users`

**Used by:** `/user info`, `/badge give/take`, context menus (info, profile)

---

### Badge

Global badge definitions (not per-guild).

| Field | Type | Description |
|-------|------|-------------|
| `id` | ObjectId | Auto-generated primary key |
| `badgeId` | String? | Custom badge identifier (mapped from `id` in MongoDB) |
| `name` | String? | Display name |
| `emoji` | String? | Emoji string or custom emoji reference |
| `animated` | Boolean? | Whether the emoji is animated |
| `emojiId` | String? | Discord emoji snowflake |
| `createdAt` | String? | Creation timestamp |

**Collection:** `badges`

**Used by:** `/badge` (create/edit/delete/give/take/list), user info displays

---

### Afk

AFK status entries — one per user per guild.

| Field | Type | Description |
|-------|------|-------------|
| `id` | ObjectId | Auto-generated primary key |
| `User` | String? | Discord user ID |
| `Guild` | String? | Discord guild ID |
| `Message` | String? | AFK reason message |
| `Nickname` | String? | Original nickname (restored when AFK removed) |

**Collection:** `afks`

**Used by:** `/afk set/remove`, AFK check event handler

---

### Xp

Experience points and level data — one per user per guild.

| Field | Type | Description |
|-------|------|-------------|
| `id` | ObjectId | Auto-generated primary key |
| `guildId` | String | Discord guild ID (required) |
| `userId` | String | Discord user ID (required) |
| `xp` | Float | Experience points (default: 0) |
| `level` | Float | Current level (default: 1) |

**Collection:** `xps`

**Used by:** `/rank info/reset/set`

---

### Welcome

Welcome system configuration — one per guild.

| Field | Type | Description |
|-------|------|-------------|
| `id` | ObjectId | Auto-generated primary key |
| `Guild` | String? | Discord guild ID |
| `Channel` | String? | Welcome message channel ID |
| `Message` | String? | Welcome message template (supports `{user}`, `{rules}`, `{server}` placeholders) |
| `Rules` | String? | Rules channel ID |
| `MemberRole` | String? | Auto-role for human members |
| `BotRole` | String? | Auto-role for bot members |

**Collection:** `welcomes`

**Used by:** Setup wizard (welcomeSSM), `guildMemberAdd` event

---

### Ticket

Ticket system configuration — one per guild.

| Field | Type | Description |
|-------|------|-------------|
| `id` | ObjectId | Auto-generated primary key |
| `Guild` | String? | Discord guild ID |
| `Channel` | String? | Ticket panel channel ID |
| `Category` | String? | Category for ticket channels |
| `Ticket` | String? | Current ticket type/subject |
| `Role` | String? | Support role with ticket access |

**Collection:** `tickets`

**Used by:** Setup wizard (ticketSSM), ticket menu, ticket modal

**Operational note:** the setup wizard stores both `Category` and `Channel`, but `src/components/modals/ticket-modal.js` currently uses `data.Channel` as the parent when creating a ticket channel. Verify this path before changing the ticket setup UX or documenting automated ticket-panel posting.

---

### GuildSchema

Per-guild settings (currently prefix only).

| Field | Type | Description |
|-------|------|-------------|
| `id` | ObjectId | Auto-generated primary key |
| `guild` | String? | Discord guild ID |
| `prefix` | String? | Custom command prefix |

**Collection:** `guildschemas`

**Used by:** Prefix command routing, `?prefix set/reset`

---

### Chatbot

Chatbot channel configuration — one per guild.

| Field | Type | Description |
|-------|------|-------------|
| `id` | ObjectId | Auto-generated primary key |
| `Guild` | String? | Discord guild ID |
| `Channel` | String? | Designated chatbot channel ID |

**Collection:** `chatbots`

**Used by:** Currently imported but not actively used in any command.

---

### JTCSetup

Join-to-Create voice channel configuration — one per guild.

| Field | Type | Description |
|-------|------|-------------|
| `id` | ObjectId | Auto-generated primary key |
| `GuildID` | String | Discord guild ID (required) |
| `Category` | String | Parent category for voice channels (required) |
| `Channel` | String | Hub voice channel ID (required) |
| `Channels` | JTCChannel[] | Array of active temporary channels |

**JTCChannel (embedded type):**

| Field | Type | Description |
|-------|------|-------------|
| `ChannelID` | String | Temporary channel ID |
| `OwnerID` | String | Channel owner's user ID |
| `MessageID` | String | Dashboard message ID |
| `isLocked` | Boolean | Whether the channel is locked (default: false) |
| `participantCount` | Int? | Current participant count |
| `isInvisible` | Boolean | Whether the channel is hidden (default: false) |

**Collection:** `jtcsetups`

**Used by:** `voiceStateUpdate` event handler

**Operational note:** `/setup` does not currently expose the JTC option, and `src/events/Guild/jointocreate.js` reads `data.UserLimit` even though the Prisma model has no `UserLimit` field. Existing deployments need manual data setup and should expect `userLimit` to be undefined unless the schema/code gap is resolved.

## Schema Files

The schema files in `src/schemas/` are thin re-exports of Prisma model delegates:

```js
// Example: src/schemas/EcoSchema.js
const { prisma } = require("../handlers/prisma");
module.exports = prisma.ecoSchema;
```

This preserves backward-compatible import paths throughout the codebase while using Prisma under the hood.
