# Engineering Guide

This guide documents the behavior verified from source in this repository. Keep it updated when command loading, deployment, configuration, or economy behavior changes.

## Startup And Configuration

The bot starts in `src/index.js`. It creates an `ExtendedClient`, calls `client.start()`, and then starts the Express sidecar with `server()`. `client.start()` is async but is not awaited by `src/index.js`, so Discord login, command deployment, optional MongoDB connection, optional Top.gg autoposting, and the HTTP listener can initialize concurrently.

Required local setup:

1. Run `npm i`.
2. Copy `.env.example` to `.env`.
3. Copy `src/example.config.js` to `src/config.js`.
4. Fill in Discord application IDs/tokens, MongoDB URIs, guild IDs, stat channel IDs, developer user IDs, and staff role IDs.
5. Run `npm run dev` for nodemon or `npm start` for node.
6. Run `npm test` before opening a PR.

Environment variables used by the code:

- `CLIENT_TOKEN` and `CLIENT_ID`: production Discord bot token and application ID.
- `DEV_TOKEN` and `DEV_CLIENT_ID`: development Discord bot token and application ID.
- `MONGODB_URI` and `DEV_MONGODB_URI`: MongoDB connection strings.
- `GUILD_ID`: support or production guild ID.
- `DEV_GUILD_ID`: guild used by ready-time slash/context-menu registration.
- `TOPGG_TOKEN`: optional; enables Top.gg autoposting in `src/functions/index.js`.

Configuration constraints:

- `src/example.config.js` is the runtime schema for `src/config.js`.
- `handler.mongodb.toggle` controls whether `src/handlers/mongoose.js` connects to MongoDB.
- MongoDB uses `config.handler.mongodb.uri` and `config.variables.dbName`.
- The Express sidecar in `src/server.js` listens on `0.0.0.0:8080` and returns `Bot is online! Join our discord here: https://discord.gg/rmqAhQz2qu` at `/`.
- `ExtendedClient` updates `config.variables.channels.botGuilds` and `config.variables.channels.botUsers` every 30 minutes. Those IDs must point to editable channels in `config.handler.guildId`.
- `PRODUCTION` deserves extra care: environment variables are strings, but several selectors in `src/example.config.js` compare `process.env.PRODUCTION === true` while MongoDB selectors use truthiness. Verify the generated `src/config.js` values before running a production bot.

## Command And Component Architecture

Command loading is handled by `src/handlers/commands.js`:

- `src/commands/slash/**`: loaded into `client.collection.interactioncommands` and `client.applicationcommandsArray`.
- `src/commands/devOnly/**`: loaded into `client.collection.developercommands` and `client.developerCommandsArray`.
- `src/commands/prefix/**`: loaded into `client.collection.prefixcommands`; aliases are stored in `client.collection.aliases`.

Component loading is handled by `src/handlers/components.js`:

- `src/components/buttons/**`: modules need `customId` and `run`.
- `src/components/selects/**`: modules need `customId` and `run`.
- `src/components/modals/**`: modules need `customId` and `run`.

Context menus are separate from the command loader. Files in `src/contextmenus/**` are read by `src/utils/getLocalContextMenus.js`, validated by `src/events/validations/contextMenuCommandValidator.js`, and registered at ready time by `src/events/ready/registerContextMenus.js`.

Slash command modules usually export:

```js
module.exports = {
  data: new SlashCommandBuilder()
    .setName("example")
    .setDescription("Example command")
    .toJSON(),
  run: async (client, interaction) => {
    // command body
  },
};
```

Developer-only slash commands under `src/commands/devOnly/**` use the same command shape and set `options.developers: true`.

```js
module.exports = {
  data: new SlashCommandBuilder()
    .setName("deploy")
    .setDescription("Deploys all the commands to the discord api!"),
  options: {
    developers: true,
  },
  run: async (client, interaction) => {
    // developer-only body
  },
};
```

Permission and safety gates are split across validators in `src/events/validations/**`:

- Regular slash commands use `chatInputCommandValidator.js` and `src/utils/getLocalCommands.js`.
- Developer-only slash commands use `devCommandValidator.js` and `src/utils/getLocalDevCommands.js`.
- `devOnly: true` or `options.developers: true`: user must be listed in `config.moderation.developers`. Regular slash/context/component validators compare against `interaction.member.id`; the developer-command validator compares against `interaction.user.id`.
- Missing or empty `config.moderation.developers`: developer-only commands in `devCommandValidator.js` are denied as misconfigured.
- `options.staffOnly: true`: enforced by `devCommandValidator.js`; the member must have one of `config.moderation.staffRoles`.
- `options.nsfw: true`: enforced by `devCommandValidator.js`; guild channel interactions must run in an NSFW channel.
- `testMode: true`: command must run in `config.handler.guildId`.
- `userPermissions`: member must have each listed Discord permission.
- `botPermissions`: the bot member must have each listed Discord permission.
- Component validators also prevent users from interacting with another user's command-owned button or select menu when `interaction.message.interaction` is present.

Event loader caveat:

- `src/handlers/events.js` registers each direct folder under `src/events` as an event name, except `validations`, which is remapped to `interactionCreate`.
- Files under `src/events/ready` and `src/events/validations` export callable functions and match that loader.
- Files under `src/events/Guild` export `{ event, run }` objects and the folder name would register as `Guild`. That shape does not match the current loader's callable function contract or Discord event names such as `messageCreate`, so verify runtime registration before relying on those handlers for prefix commands or component routing.

## Command Deployment

There are two deployment paths:

- Ready-time slash registration in `src/events/ready/registerCommands.js` fetches guild application commands for `process.env.DEV_GUILD_ID`, compares local command data, and creates, edits, or deletes commands.
- Ready-time context menu registration in `src/events/ready/registerContextMenus.js` also uses `process.env.DEV_GUILD_ID`, but it only creates missing menus and deletes menus marked `deleted`; it does not edit existing menu definitions.
- Developer command deployment in `src/handlers/deploy.js` writes commands from `client.collection.developercommands` to `config.handler.guildId`. It is invoked after login in `ExtendedClient.start()` without `await`, and can also be triggered by the developer-only `/deploy` command.

Troubleshooting command registration:

- If slash commands do not update, confirm `DEV_GUILD_ID` is set and the bot is in that guild.
- If developer commands are missing, confirm `config.handler.guildId` resolves to the intended guild and `config.moderation.developers` contains the operator's Discord user ID.
- If command options are not changing, inspect `src/utils/commandComparing.js`; it normalizes name, description, options, and choices before deciding whether to edit an existing command.
- `config.handler.deploy` and `config.handler.guildDeploy` exist in `src/example.config.js`, but the verified deployment paths above do not currently read those flags.

## Economy Notes

Economy data is stored in MongoDB with `src/schemas/EcoSchema.js`:

```js
{
  Guild: String,
  User: String,
  Bank: Number,
  Wallet: Number
}
```

User-facing economy commands live in `src/commands/slash/Economy/**`:

- `/economy`: creates an account with `Wallet: 0` and `Bank: 1000`, or deletes the current user's account with `doc.deleteOne()`.
- `/bal`: reports wallet, bank, and total balances.
- `/deposit amount`: moves money from wallet to bank. `amount` can be a number or `all`.
- `/withdraw amount`: moves money from bank to wallet. `amount` can be a number or `all`.
- `/beg`: randomly chooses a positive or negative wallet change. It saves the wallet update only if the user has an account, but still sends the result reply when no account exists.
- `/rob user`: requires both users to have economy accounts and the robber to have at least `$100`, and it takes a per-user cooldown lock before database reads. The regression tests document the intended success/failure transfer behavior; verify `rob.js` directly before changing runtime behavior because several past bugs involved cooldown races and uncapped fines.

`/rob` workflow and constraints:

1. The command checks an in-memory per-user cooldown before reading from MongoDB.
2. It immediately records the robber's user ID in `timeout` before the first `await`; this is the command's only guard against concurrent calls from the same user.
3. It rejects self-robs, missing robber or target accounts, robber wallets below `$100`, and target wallets below `$100`.
4. It rolls a 1-100 chance. Values up to `50` are successful robberies.
5. The transfer or fine amount is rolled from `1..TargetData.Wallet`.
6. On success, the robber gains the amount and the target loses it.
7. On failure, the robber pays the target `Math.min(amount, Data.Wallet)` so a fine cannot make the robber wallet negative.
8. After a saved success or failure, the cooldown is released after 60 seconds. Early validation failures and thrown errors release it immediately.

Maintenance pitfalls for `/rob`:

- Keep `try`/`catch` around all awaited work after the cooldown lock, or unexpected errors can leave the user stuck on cooldown.
- Do not move `timeout.push(user.id)` below an `await`; that reintroduces the race covered by `tests/rob-cooldown-race.test.js`.
- Because `EcoSchema` has no minimum-value validation, command code must prevent negative balances before calling `save()`.
- Run `node --check src/commands/slash/Economy/rob.js` or `npm test` after editing this module; a previous bad merge left invalid JavaScript that broke command loading during startup.

Regression tests in `tests/` document important economy invariants:

- `tests/economy-amount-all.test.js`: `all` must match case-insensitively for deposit and withdraw.
- `tests/economy-account-delete.test.js`: account deletion must delete by user and guild and must not rely on `deleteMany()` on a document.
- `tests/rob-syntax.test.js`: `/rob` must parse as valid JavaScript before the command loader requires it.
- `tests/rob-cooldown-race.test.js`: `/rob` must take its per-user cooldown lock before any `await` to avoid overlapping balance saves.
- `tests/rob-caught-penalty.test.js`, `tests/rob-failure-penalty.test.js`, and `tests/rob-fine-cap.test.js`: a failed robbery fine must not exceed the robber's current wallet.

When changing economy code, prefer adding or updating focused `node:test` regression tests in `tests/` before adjusting command behavior.

## Operational Pitfalls

- The bot requires Discord gateway intents that match the enabled features. `ExtendedClient` currently passes a numeric intent bitfield, so keep Discord Developer Portal settings in sync when changing message, member, or guild-dependent behavior.
- MongoDB failures are logged and rethrown from `src/handlers/mongoose.js`; `ExtendedClient.start()` attaches a `.catch()` and does not block Discord login on a successful connection. Commands that use MongoDB still depend on a valid URI, network, and database credentials when `handler.mongodb.toggle` is true.
- Top.gg autoposting only starts when `TOPGG_TOKEN` is present, but the functions module is required during client startup.
- The health endpoint is not authenticated. Do not expose port `8080` publicly unless that is intentional for the hosting environment.
- Prefix command support depends on the `messageCreate` handler in `src/events/Guild/messageCreate.js`; because of the event loader caveat above, verify runtime registration before documenting prefix commands as available to server members.
