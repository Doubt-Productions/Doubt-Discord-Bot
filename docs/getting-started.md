# Getting Started

This guide walks you through setting up Doubt for local development.

## Prerequisites

- **Node.js** v16.11 or higher (v18+ LTS recommended)
- **npm** (included with Node.js)
- **MongoDB** — either a local instance, Docker container, or [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **Discord Application** — create one at the [Discord Developer Portal](https://discord.com/developers/applications)

## Step 1: Clone the Repository

```bash
git clone https://github.com/Doubt-Productions/Doubt-Discord-Bot.git
cd Doubt-Discord-Bot
```

## Step 2: Install Dependencies

```bash
npm install
```

This installs all runtime dependencies and the Prisma CLI (dev dependency). The repository does not define a `postinstall` hook, so generate the Prisma client explicitly after installing dependencies or changing `prisma/schema.prisma`.

Generate or regenerate the Prisma client with:

```bash
npx prisma generate
```

## Step 3: Configure Environment Variables

Copy the environment template:

```bash
cp .env.example .env
```

Fill in the required values. See [Configuration](configuration.md) for details on each variable.

At minimum for development, you need:

```env
PRODUCTION=false
DEV_TOKEN=your_discord_bot_token
DEV_CLIENT_ID=your_discord_app_id
DEV_GUILD_ID=your_test_server_id
DEV_MONGODB_URI=mongodb://localhost:27017/doubt-dev
DATABASE_URL=mongodb://localhost:27017/doubt-dev
```

`DEV_MONGODB_URI` is used by the running bot. `DATABASE_URL` is used by Prisma CLI commands. Keep both pointed at the same database during local development.

## Step 4: Configure the Bot

Copy the configuration template:

```bash
cp src/example.config.js src/config.js
```

Edit `src/config.js` to set:

- **`moderation.developers`** — array of Discord user IDs who can use developer commands
- **`moderation.staffRoles`** — array of role IDs for staff-only commands
- **`variables.channels.logs`** — channel ID for logging (optional)
- **`variables.channels.botGuilds`** / **`botUsers`** — channel IDs for stat displays (optional, but the bot will error every 30 minutes if not configured)

## Step 5: Set Up the Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application (or use an existing one)
3. Navigate to **Bot** → copy the bot token → paste as `DEV_TOKEN` in `.env`
4. Copy the Application ID → paste as `DEV_CLIENT_ID`
5. Enable these **Privileged Gateway Intents**:
   - Presence Intent
   - Server Members Intent
   - Message Content Intent
6. Navigate to **OAuth2** → **URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Permissions: Administrator (or the specific permissions you need)
7. Use the generated URL to invite the bot to your test server
8. Copy your test server ID → paste as `DEV_GUILD_ID`

## Step 6: Set Up MongoDB

### Option A: Docker (recommended for development)

```bash
docker run -d --name mongodb -p 27017:27017 mongo:7
```

Set `DEV_MONGODB_URI=mongodb://localhost:27017/doubt-dev` in your `.env`.

### Option B: MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user and get the connection string
3. Set `DEV_MONGODB_URI` to the Atlas connection string, including the database name before query parameters:

```env
DEV_MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/doubt-dev?retryWrites=true
```

If the runtime URI has an empty path, the bot appends `config.variables.dbName` (`development` locally, `production` when `PRODUCTION=true`) and logs a warning. Prefer setting the database name explicitly because `DATABASE_URL` for Prisma CLI commands is not rewritten by the bot.

## Step 7: Run the Bot

### Development mode (with auto-restart):

```bash
npm run dev
```

### Production mode:

```bash
npm start
```

You should see:
- Command loading tables (slash, prefix, dev-only)
- Event registration table
- Component loading table
- `[SUCCESS] Prisma connected to MongoDB!`
- `Logged in on discord as: YourBot#1234`
- `Running on http://0.0.0.0:8080`

## Step 8: Verify

1. Check the health endpoint: `curl http://localhost:8080/`
2. In your Discord test server, try `/ping` or `/test`
3. Run the test suite: `npm test`

## Common Issues

### Bot doesn't respond to slash commands

- Verify `DEV_GUILD_ID` matches your test server ID
- Check that the bot has the `applications.commands` scope
- Wait a few seconds after startup for command registration

### MongoDB connection fails

- Ensure MongoDB is running and accessible at the URI you configured
- For Atlas: check that your IP is whitelisted in Network Access
- Verify the connection string is not blank and includes the intended database name
- If startup logs say the URI had no database name, add `/your-db-name` to `DEV_MONGODB_URI`, `MONGODB_URI`, and `DATABASE_URL` so runtime and Prisma CLI commands use the same database

### Channel editing errors every 30 minutes

The bot tries to rename `botGuilds` and `botUsers` channels periodically. If these channel IDs are empty or invalid in `config.js`, the bot will log errors. Either set valid channel IDs or ignore these non-fatal errors.

### Prefix commands don't work

Prefix commands are disabled by default. In `src/config.js`, set `handler.commands.prefix` to `true` to enable them.
