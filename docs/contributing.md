# Contributing

Guide for developers contributing to the Doubt Discord Bot.

## Development Setup

See [Getting Started](getting-started.md) for full setup instructions. Quick start:

```bash
git clone https://github.com/Doubt-Productions/Doubt-Discord-Bot.git
cd Doubt-Discord-Bot
npm install
cp .env.example .env        # Fill in credentials
cp src/example.config.js src/config.js  # Fill in IDs
npm run dev                  # Start with nodemon
```

## Project Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm start` | `node .` | Start the bot |
| `npm run dev` | `nodemon .` | Start with auto-restart on file changes |
| `npm test` | `node --test tests/*.test.js` | Run the test suite |

## Releases

GitHub Releases are automated by `.github/workflows/release.yml` on pushes to `main`:

1. The workflow reads the top-level `version` from `package.json`.
2. It derives the tag as `v<version>`.
3. It skips release creation when that tag already exists.
4. When the tag is new, it installs dependencies, runs `npm test`, generates a changelog from the previous version-sorted tag to `HEAD`, and creates the GitHub Release.

To cut a release, bump `package.json` before merging to `main`. The workflow does not create version bumps, does not inspect the latest commit for a version-line diff, and does not publish npm packages, Docker images, or Discord command updates.

## Code Structure

### Adding a Slash Command

Create a new file in `src/commands/slash/<Category>/`:

```js
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mycommand")
    .setDescription("Description of my command")
    .toJSON(),
  run: async (client, interaction) => {
    await interaction.reply("Hello!");
  },
};
```

The command is automatically loaded at startup and registered on `DEV_GUILD_ID`.

### Adding a Developer Command

Create a new file in `src/commands/devOnly/Developers/`:

```js
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mydevcommand")
    .setDescription("Developer-only command"),
  options: {
    developers: true,
  },
  run: async (client, interaction) => {
    await interaction.reply({ content: "Dev only!", ephemeral: true });
  },
};
```

### Adding a Prefix Command

Create a new file in `src/commands/prefix/<Category>/`:

```js
module.exports = {
  data: {
    name: "myprefix",
    description: "A prefix command",
    aliases: ["mp"],
    permissions: null,
    developers: false,
  },
  run: async (client, message, args) => {
    await message.reply("Hello from prefix command!");
  },
};
```

Remember: prefix commands are disabled by default (`config.handler.commands.prefix`).

### Adding a Component Handler

#### Button

Create in `src/components/buttons/`:

```js
module.exports = {
  customId: "my-button",
  run: async (client, interaction) => {
    await interaction.reply({ content: "Button clicked!", ephemeral: true });
  },
};
```

#### Select Menu

Create in `src/components/selects/`:

```js
module.exports = {
  customId: "my-select",
  run: async (client, interaction) => {
    const selected = interaction.values[0];
    await interaction.reply({ content: `Selected: ${selected}`, ephemeral: true });
  },
};
```

#### Modal

Create in `src/components/modals/`:

```js
module.exports = {
  customId: "my-modal",
  run: async (client, interaction) => {
    const field = interaction.fields.getTextInputValue("my-field");
    await interaction.reply({ content: `You said: ${field}`, ephemeral: true });
  },
};
```

### Adding a Context Menu

Create in `src/contextmenus/`:

```js
const { ContextMenuCommandBuilder, ApplicationCommandType } = require("discord.js");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("My Menu")
    .setType(ApplicationCommandType.User),
  run: async (client, interaction) => {
    const target = interaction.targetUser;
    await interaction.reply({ content: `Target: ${target.username}`, ephemeral: true });
  },
};
```

### Adding a Database Model

1. Add the model to `prisma/schema.prisma`
2. Run `npx prisma generate` to regenerate the client
3. Create a schema re-export in `src/schemas/`:

```js
const { prisma } = require("../handlers/prisma");
module.exports = prisma.myModel;
```

4. Import and use in your command:

```js
const myModel = require("../../../schemas/myModel");
const data = await myModel.findFirst({ where: { guildId: guild.id } });
```

## Testing

### Running Tests

```bash
npm test
```

Tests use Node.js built-in test runner (`node:test`) and do not require MongoDB, Discord, or any external service.

### Writing Tests

Create test files in `tests/` with the `.test.js` extension:

```js
const { test } = require("node:test");
const assert = require("node:assert");

test("my feature works correctly", () => {
  const result = myFunction(input);
  assert.strictEqual(result, expected);
});
```

### Test Philosophy

- Tests should be pure unit tests that can run without external services
- Focus on business logic, not Discord API interactions
- Test edge cases for economy calculations, permission checks, and data validation
- Use `node --check` for syntax verification of command files

### Existing Test Coverage

| Test File | What It Tests |
|-----------|---------------|
| `dev-command-gate.test.js` | Developer command `options.developers` flag detection |
| `developer-gate.test.js` | Developer ID allowlist validation |
| `prefix-developer-gate.test.js` | Prefix command developer restriction |
| `economy-amount-all.test.js` | Case-insensitive `all` keyword for deposit/withdraw |
| `economy-account-delete.test.js` | Account deletion uses Prisma delegate deletes instead of document-shaped methods |
| `events-handler-shape.test.js` | Event loader registers validation functions, ready functions, and Guild `{ event, run }` modules correctly |
| `interaction-cooldown.test.js` | Guild backup slash-command cooldown bookkeeping is per user and command |
| `rank-card-presence-status.test.js` | Rank-card presence values are normalized for `canvacord` |
| `rob-syntax.test.js` | `/rob` source file is valid JavaScript |
| `rob-module-loads.test.js` | `/rob` file parses without errors |
| `rob-cooldown-race.test.js` | Cooldown lock prevents concurrent rob races |
| `rob-caught-penalty.test.js` | Failed robbery penalty is capped at wallet |
| `rob-failure-penalty.test.js` | Failed rob transfer amount is capped |
| `rob-fine-cap.test.js` | Fine cannot exceed robber's wallet |

## Code Conventions

### Command Handler Signature

All slash and developer commands use:

```js
run: async (client, interaction) => { ... }
```

Prefix commands use:

```js
run: async (client, message, args) => { ... }
```

### Database Access

Always use the Prisma model delegates via schema re-exports:

```js
const ecoSchema = require("../../../schemas/EcoSchema");

// Find
const data = await ecoSchema.findFirst({ where: { User: userId, Guild: guildId } });

// Create
const newData = await ecoSchema.create({ data: { User: userId, Guild: guildId, Wallet: 0, Bank: 1000 } });

// Update
await ecoSchema.update({ where: { id: data.id }, data: { Wallet: newValue } });

// Delete
await ecoSchema.delete({ where: { id: data.id } });

// Delete many
await ecoSchema.deleteMany({ where: { User: userId, Guild: guildId } });
```

### Error Handling

- Use `try/catch` around database operations and Discord API calls
- Log errors with `log(error, "err")` from `src/functions`
- For interaction handlers, always ensure a reply is sent (even on error)
- Use `ephemeral: true` for error messages

### Logging

Use the `log` function from `src/functions`:

```js
const { log } = require("../functions");

log("Something happened", "info");   // Blue [INFO]
log("Warning message", "warn");      // Yellow [WARNING]
log("Success!", "done");             // Green [SUCCESS]
log("Error occurred", "err");        // Red [ERROR]
```

## Pull Request Guidelines

1. Run `npm test` before opening a PR — all tests must pass
2. Run `node --check` on any modified command files to verify syntax
3. Add regression tests for bug fixes when practical
4. Keep commits focused and descriptive
5. Update documentation if adding new features or changing behavior
