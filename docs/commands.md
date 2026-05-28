# Commands Reference

Complete reference for all bot commands organized by type and category.

## Slash Commands

Slash commands are registered per-guild on `DEV_GUILD_ID` at startup.

### Economy

| Command | Description | Options |
|---------|-------------|---------|
| `/economy` | Create or delete your economy account | Interactive buttons: Create (starts with $1000 in bank) or Delete |
| `/bal` | Check your wallet, bank, and total balance | — |
| `/deposit <amount>` | Move money from wallet to bank | `amount` (required): number or `all` |
| `/withdraw <amount>` | Move money from bank to wallet | `amount` (required): number or `all` |
| `/beg` | Beg for money (random gain or loss) | — |
| `/rob <user>` | Attempt to rob another user | `user` (required): target user. Requires $100 minimum in wallet. 50% success chance. 60-second cooldown. |

**Economy Notes:**
- Create an account with `/economy` before using other economy commands.
- New accounts start with $0 wallet and $1000 bank.
- `/rob` requires both robber and target to have at least $100.
- Failed robberies fine the robber (capped at their wallet balance).

### General

| Command | Description | Options |
|---------|-------------|---------|
| `/afk set [message]` | Set your AFK status | `message` (optional): AFK reason |
| `/afk remove` | Remove your AFK status | — |
| `/rank info <user>` | View XP rank card | `user` (required): target server member |
| `/rank reset <user>` | Reset a user's XP and level | `user` (required) |
| `/rank set <user> <level>` | Set a user's level | `user` (required), `level` (required) |
| `/test` | Simple test command | — |

### Information

| Command | Description | Options |
|---------|-------------|---------|
| `/help` | View available commands by category | Interactive select menu |
| `/user info [user]` | Detailed user information with badges | `user` (optional): defaults to self |
| `/botinfo` | Bot statistics and information | — |
| `/serverinfo` | Server information (3 pages) | Paginated with buttons |

### Utility

| Command | Description | Options |
|---------|-------------|---------|
| `/ping` | Bot latency and WebSocket ping | — |
| `/embedcreator` | Create a custom embed | `title`, `description`, `color` (required); `channel`, `image`, `thumbnail`, `footer` (optional) |

### Moderation

| Command | Description | Options |
|---------|-------------|---------|
| `/kick <user> [reason]` | Kick a member | `user` (required), `reason` (optional) |
| `/ban <user> [reason]` | Ban a member | `user` (required), `reason` (optional) |
| `/unban <user>` | Unban a user by ID | `user` (required): user ID string |
| `/timeout <user> <duration> [reason]` | Timeout a member | `user` (required), `duration` (required, e.g. `5m`, `1h`, `7d`), `reason` (optional). Range: 5 seconds to 28 days. |
| `/automod flagged-words <channel>` | Set up flagged words automod | `channel` (required): alert channel |
| `/automod spam-messages <channel>` | Set up spam detection | `channel` (required): alert channel |
| `/automod mention-spam <number> <channel> [duration]` | Set up mention spam detection | `number` (required): max mentions, `channel` (required), `duration` (optional) |
| `/automod keyword <keyword> <channel>` | Block a specific keyword | `keyword` (required), `channel` (required) |

### Management

| Command | Description | Options |
|---------|-------------|---------|
| `/setup` | Open the setup wizard | — |

The setup wizard provides a select menu to configure:
- **Welcome System** — channel, message template, rules channel, member/bot auto-roles
- **Ticket System** — category, panel channel, support role

Join-to-Create is shown in the setup embed as a future feature, but the current select menu does not include a JTC option.

---

## Context Menu Commands

Right-click a user or message to access these commands.

| Command | Type | Description |
|---------|------|-------------|
| **Info** | User | View user information and badges |
| **Profile** | User | Generate a user profile card image |
| **Get Avatar** | User | View a user's avatar in full size |
| **Translate Message** | Message | Translate a message to English |

---

## Prefix Commands

Prefix commands use `?` by default (configurable per-guild). They are **disabled by default** — set `handler.commands.prefix: true` in `config.js` to enable.

| Command | Aliases | Description | Permissions |
|---------|---------|-------------|-------------|
| `?help` | `?h` | List all available commands | — |
| `?ping` | `?p` | Check bot latency | Administrator |
| `?prefix set <new>` | — | Change the guild's command prefix | Administrator |
| `?prefix reset` | — | Reset prefix to default | Administrator |
| `?eval <code>` | `?e` | Evaluate JavaScript code | Developer only |

---

## Developer Commands

These commands are deployed only to the support/dev guild (`config.handler.guildId`). Most require the user's ID to be listed in `config.moderation.developers`.

| Command | Description | Gate |
|---------|-------------|------|
| `/connectdb` | Attempt to reconnect to the database | developers |
| `/deploy` | Re-deploy developer commands to the guild | developers |
| `/eval <code>` | Evaluate JavaScript code | developers |
| `/simjoin` | Simulate a member joining (fires `guildMemberAdd`) | developers |
| `/simleave` | Emit a `guildMemberRemove` event for a member object | developers |
| `/listguilds` | List all guilds the bot is in (paginated) | developers |
| `/badge create <name> <emoji>` | Create a new badge | developers |
| `/badge edit <id> [name] [emoji]` | Edit a badge | developers |
| `/badge delete <id>` | Delete a badge | developers |
| `/badge give <id> <user>` | Give a badge to a user | developers |
| `/badge take <id> <user>` | Remove a badge from a user | developers |
| `/badge list` | List all badges | developers |
| `/staffonly` | Test staff role check | staffOnly |
| `/nsfw` | Test NSFW channel check | staffOnly + nsfw |
| `/testembed` | Test embed helper function | developers |
