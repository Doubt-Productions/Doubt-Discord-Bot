# Doubt Discord Bot — Documentation

Welcome to the official documentation for **Doubt**, an advanced multi-purpose Discord bot built with [discord.js v14](https://discord.js.org/), [Prisma](https://www.prisma.io/) (MongoDB), and [Express](https://expressjs.com/).

## Table of Contents

| Document | Description |
|----------|-------------|
| [Getting Started](getting-started.md) | Installation, configuration, and running the bot |
| [Configuration](configuration.md) | Environment variables and `config.js` reference |
| [Commands](commands.md) | Complete reference for all slash, prefix, and developer commands |
| [Features](features.md) | In-depth guides for economy, tickets, welcome, AFK, and more |
| [Database](database.md) | Prisma schema, models, and data layer |
| [Architecture](architecture.md) | Codebase structure, event pipeline, and handler system |
| [Engineering Guide](engineering-guide.md) | Detailed runtime behavior and operational notes |
| [Contributing](contributing.md) | Developer setup, coding conventions, and testing |

## Quick Overview

Doubt is a feature-rich Discord bot offering:

- **Moderation** — kick, ban, unban, timeout, automod rules
- **Economy System** — wallet/bank accounts, begging, deposits, withdrawals, robbery
- **Ticket System** — configurable support tickets with HTML transcripts
- **Welcome System** — customizable join messages and auto-roles
- **AFK System** — automatic AFK status with mention notifications
- **Join-to-Create** — temporary voice channels when existing setup data is present; `/setup` does not expose a complete JTC configuration path yet
- **Rank/XP System** — per-guild leveling with rank cards
- **Utility** — embeds, user info, server info, translation, avatars
- **Developer Tools** — eval, deploy, badge management, simulated joins/leaves

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js (v16.11+) |
| Bot Framework | discord.js v14 |
| Database | MongoDB (via Prisma v6) |
| HTTP Server | Express (health-check on port 8080) |
| Package Manager | npm |

## Project Structure

```
doubt/
├── docs/                  # Documentation
├── prisma/
│   └── schema.prisma      # Prisma schema (MongoDB models)
├── src/
│   ├── class/             # ExtendedClient (bot client)
│   ├── commands/
│   │   ├── devOnly/       # Developer-only slash commands
│   │   ├── prefix/        # Legacy prefix commands
│   │   └── slash/         # Slash commands (Economy, General, Info, etc.)
│   ├── components/
│   │   ├── buttons/       # Button interaction handlers
│   │   ├── modals/        # Modal submission handlers
│   │   └── selects/       # Select menu handlers
│   ├── contextmenus/      # Right-click context menu commands
│   ├── events/
│   │   ├── Guild/         # Guild event handlers (messages, voice, members)
│   │   ├── ready/         # Bot ready event handlers
│   │   └── validations/   # Interaction validation pipeline
│   ├── functions/         # Shared utility functions
│   ├── handlers/          # Module loaders (commands, events, components, Prisma)
│   ├── schemas/           # Prisma model re-exports
│   ├── utils/             # Helper utilities
│   ├── config.js          # Runtime configuration (gitignored)
│   ├── example.config.js  # Configuration template
│   ├── index.js           # Entry point
│   └── server.js          # Express health-check server
├── tests/                 # Unit tests (Node.js test runner)
├── .env.example           # Environment variable template
└── package.json           # Dependencies and scripts
```

## License

GPL-3.0 — See [LICENSE](../LICENSE) for details.
