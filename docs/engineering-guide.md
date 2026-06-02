# Engineering Guide

This guide documents the behavior verified from source in this repository. Keep it updated when command loading, deployment, configuration, or economy behavior changes.

## Startup And Configuration

The bot starts in `src/index.js`. It creates an `ExtendedClient`, calls `client.start()`, and then starts the Express sidecar with `server()`. `client.start()` is async but is not awaited by `src/index.js`, so Discord login, command deployment, optional Prisma/MongoDB connection, optional Top.gg autoposting, and the HTTP listener can initialize concurrently.

Required local setup:

1. Run `npm i`.
2. Copy `.env.example` to `.env`.
3. Copy `src/example.config.js` to `src/config.js`.
4. Fill in Discord application IDs/tokens, MongoDB URIs, guild IDs, stat channel IDs, developer user IDs, and staff role IDs.
5. Set `DATABASE_URL` for Prisma CLI commands. The runtime client reads the MongoDB URI from `src/config.js`, so keep `DATABASE_URL` aligned with the selected runtime URI when generating or pushing schema metadata.
6. Run `npx prisma generate` after installing dependencies or changing `prisma/schema.prisma`.
7. Run `npm run dev` for nodemon or `npm start` for node.
8. Run `npm test` before opening a PR.

Environment variables used by the code:

- `CLIENT_TOKEN` and `CLIENT_ID`: production Discord bot token and application ID.
- `DEV_TOKEN` and `DEV_CLIENT_ID`: development Discord bot token and application ID.
- `MONGODB_URI` and `DEV_MONGODB_URI`: MongoDB connection strings.
- `DATABASE_URL`: MongoDB connection string used by Prisma CLI commands such as `prisma generate` and `prisma db push`.
- `GUILD_ID`: support or production guild ID.
- `DEV_GUILD_ID`: guild used by ready-time slash/context-menu registration.
- `TOPGG_TOKEN`: optional; enables Top.gg autoposting in `src/functions/index.js`.

Configuration constraints:

- `src/example.config.js` is the runtime schema for `src/config.js`.
- `handler.mongodb.toggle` controls whether `ExtendedClient.start()` calls `connectPrisma()` from `src/handlers/prisma.js`.
- Prisma runtime queries use `config.handler.mongodb.uri`. `DATABASE_URL` is only read by Prisma CLI tools.
- `config.variables.dbName` still exists for configuration compatibility, but the verified Prisma startup path does not read it; include the database name in the MongoDB URI instead.
- The Express sidecar in `src/server.js` listens on `0.0.0.0:8080` and returns `Bot is online! Join our discord here: https://discord.gg/rmqAhQz2qu` at `/`.
- `ExtendedClient` updates `config.variables.channels.botGuilds` and `config.variables.channels.botUsers` every 30 minutes. Those IDs must point to editable channels in `config.handler.guildId`.
- `PRODUCTION` deserves extra care: environment variables are strings. Token, client ID, and guild ID selection compare against `"true"`, but MongoDB URI selection uses `process.env.PRODUCTION` truthiness. With `PRODUCTION=false` as a string, `config.handler.mongodb.uri` still selects `MONGODB_URI`. Verify the generated `src/config.js` values before running a bot.

## Prisma Persistence

Persistence now runs through Prisma v6 with the MongoDB provider:

- `prisma/schema.prisma` defines the generated client models and maps them to existing MongoDB collections with `@@map`, such as `ecoschemas`, `users`, `badges`, `afks`, `xps`, `welcomes`, `tickets`, `guildschemas`, `chatbots`, and `jtcsetups`.
- `src/handlers/prisma.js` exports a singleton `prisma` client and `connectPrisma()`. The client is constructed with `datasourceUrl: config.handler.mongodb.uri`.
- Files in `src/schemas/**` are compatibility modules that export Prisma delegates, for example `src/schemas/EcoSchema.js` exports `prisma.ecoSchema` and `src/schemas/GuildSchema.js` exports `prisma.guildSchema`.
- The legacy `src/handlers/mongoose.js` file remains in the tree, but `ExtendedClient` imports `src/handlers/prisma.js`. Do not add new imports of the Mongoose handler unless Mongoose is intentionally restored as a dependency.

Use Prisma delegate methods instead of Mongoose document methods:

```js
const ecoSchema = require("../schemas/EcoSchema");

const account = await ecoSchema.findFirst({
  where: { Guild: guild.id, User: user.id },
});

if (account) {
  await ecoSchema.update({
    where: { id: account.id },
    data: { Wallet: account.Wallet + 100 },
  });
}
```

Prisma constraints and pitfalls:

- Query filters are nested under `where`, and writes are nested under `data`.
- Returned records are plain objects. They do not have Mongoose methods such as `save()`, `deleteOne()`, or document-scoped `deleteMany()`.
- Current models do not define unique compound indexes for guild/user pairs. Existing code usually reads with `findFirst({ where: ... })`, then updates or deletes by the returned `id`.
- MongoDB is schema-less, so this repo does not use `prisma migrate`. Run `npx prisma generate` after schema edits, and use `npx prisma db push` only when you intentionally need Prisma to sync MongoDB indexes or schema metadata.

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

Command execution contracts:

- The Guild slash-command handler in `src/events/Guild/interactionCreate.js` supports `command.options.cooldown` as a millisecond duration. The cooldown store is an in-memory `Map` keyed by Discord user ID, with command names as values, so it is per-process and clears on restart.
- Slash cooldowns are per user and per command name. A user can be cooling down for one slash command while using another command, and another user is not blocked by the first user's cooldown.
- The slash cooldown is recorded before `command.run(client, interaction)` executes. Expiry uses `setTimeout`; if another timer has already removed the user entry, the expiry handler no-ops instead of throwing.
- The active chat-input path may be handled by the Guild `interactionCreate` router or by the validation chain, depending on listener registration order. The Guild router applies `command.options.cooldown`; `src/events/validations/chatInputCommandValidator.js` does not.
- Prefix commands are executed through `src/events/Guild/messageCreate.js` with `await command.run(client, message, args)`, so async command failures are caught by that handler's `try/catch` and logged through `log(error, "err")`.
- Prefix command metadata can include `data.permissions` and `data.developers`; `data.cooldown` is present on the prefix eval command but is not enforced by `messageCreate.js`.

Event loader contract:

- `src/handlers/events.js` scans only the direct child folders under `src/events`.
- Files in `src/events/validations` must export functions. The loader registers one `interactionCreate` listener for that folder, then awaits each validator sequentially with `eventFunction(client, ...args)`.
- Function exports in other event folders are grouped under the folder name. This is how `src/events/ready/**` handlers run on Discord's `ready` event.
- Object exports with `{ event, run }` are registered individually on `event`, then invoked as `eventModule.run(client, ...args)`. This is how `src/events/Guild/messageCreate.js`, `guildMemberAdd.js`, `jointocreate.js`, `interactionCreate.js`, and `components.js` attach to Discord events.
- The Guild folder contains two `interactionCreate` object handlers in addition to the validations listener. Keep `interaction.replied || interaction.deferred` guards on any fallback interaction router, and add equivalent guards to new `interactionCreate` handlers unless they own a completely separate interaction type.
- Do not rely on a nested subfolder under `src/events`; the loader does not recurse into event folders.
- Run `npm test` after editing `src/handlers/events.js`. `tests/events-handler-shape.test.js` covers object-style module registration and the `validations` special-case.

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

## GitHub Release Automation

`.github/workflows/release.yml` publishes GitHub Releases from `main` when `package.json` changes the top-level `version` field.

Release workflow behavior:

1. A push to `main` starts the `Release` workflow.
2. The workflow reads `package.json` with Node and derives the release tag as `v<version>`, for example `v1.2.1`.
3. It checks only the latest pushed commit range, `HEAD~1..HEAD`, for a `package.json` line containing `"version"`.
4. If the version changed, it fetches tags and skips the release when the derived tag already exists.
5. If the tag is new, it sets up Node.js `22`, installs dependencies with `npm ci || npm install`, runs `npm test`, generates a changelog from commits since the most recent version-sorted tag, and creates a non-draft, non-prerelease GitHub Release with `softprops/action-gh-release`.

Release operator notes:

- Bump `package.json` in the commit that lands on `main` when you want a release. The workflow does not create or commit version bumps.
- The workflow creates a Git tag through the GitHub Release action; do not pre-create the same `v<version>` tag unless you intend the workflow to skip release creation.
- The workflow publishes a GitHub Release only. It does not publish an npm package, build Docker images, deploy the bot, or update Discord commands.
- `contents: write` permission is required so the workflow token can create the release and tag.
- Release creation is gated by `npm test`; keep tests passing before merging a version bump.

## Economy Notes

Economy data is stored in MongoDB through the `EcoSchema` Prisma model. `src/schemas/EcoSchema.js` exports the `prisma.ecoSchema` delegate, and the model maps to the `ecoschemas` collection:

```prisma
model EcoSchema {
  id     String  @id @default(auto()) @map("_id") @db.ObjectId
  Guild  String?
  User   String?
  Bank   Float?
  Wallet Float?

  @@map("ecoschemas")
}
```

User-facing economy commands live in `src/commands/slash/Economy/**`:

- `/economy`: creates an account with `Wallet: 0` and `Bank: 1000`, or deletes the found account with `ecoSchema.delete({ where: { id: doc.id } })`.
- `/bal`: reports wallet, bank, and total balances.
- `/deposit amount`: moves money from wallet to bank. `amount` can be a number or `all`.
- `/withdraw amount`: moves money from bank to wallet. `amount` can be a number or `all`.
- `/beg`: randomly chooses a positive or negative wallet change. It updates `Wallet` only if the user has an account, but still sends the result reply when no account exists.
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

Maintenance pitfalls for economy commands:

- Keep `try`/`catch` around all awaited work after the cooldown lock, or unexpected errors can leave the user stuck on cooldown.
- Do not move `timeout.push(user.id)` below an `await`; that reintroduces the race covered by `tests/rob-cooldown-race.test.js`.
- Because `EcoSchema` has no minimum-value validation, command code must prevent negative balances before calling `ecoSchema.update()`.
- Because there is no unique Prisma constraint for `{ Guild, User }`, account creation still relies on application-level `findFirst` checks.
- Run `node --check src/commands/slash/Economy/rob.js` or `npm test` after editing this module; a previous bad merge left invalid JavaScript that broke command loading during startup.

Regression tests in `tests/` document important economy invariants:

- `tests/economy-amount-all.test.js`: `all` must match case-insensitively for deposit and withdraw.
- `tests/economy-account-delete.test.js`: documents the old deletion failure mode where code relied on document-shaped `deleteMany()` behavior. Current Prisma code should delete or update through the model delegate.
- `tests/rob-syntax.test.js`: `/rob` must parse as valid JavaScript before the command loader requires it.
- `tests/rob-cooldown-race.test.js`: `/rob` must take its per-user cooldown lock before any `await` to avoid overlapping balance saves.
- `tests/rob-caught-penalty.test.js`, `tests/rob-failure-penalty.test.js`, and `tests/rob-fine-cap.test.js`: a failed robbery fine must not exceed the robber's current wallet.

When changing economy code, prefer adding or updating focused `node:test` regression tests in `tests/` before adjusting command behavior.

## Operational Pitfalls

- The bot requires Discord gateway intents that match the enabled features. `ExtendedClient` currently passes a numeric intent bitfield, so keep Discord Developer Portal settings in sync when changing message, member, or guild-dependent behavior.
- Prisma/MongoDB connection failures are logged and rethrown from `src/handlers/prisma.js`; `ExtendedClient.start()` attaches a `.catch()` and does not block Discord login while the connection attempt runs. Commands that query MongoDB still depend on a valid runtime URI, network, generated Prisma client, and database credentials.
- Top.gg autoposting only starts when `TOPGG_TOKEN` is present, but the functions module is required during client startup.
- The health endpoint is not authenticated. Do not expose port `8080` publicly unless that is intentional for the hosting environment.
- Prefix command support depends on the `messageCreate` handler in `src/events/Guild/messageCreate.js`; because of the event loader caveat above, verify runtime registration before documenting prefix commands as available to server members.
