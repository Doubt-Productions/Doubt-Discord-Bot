# Features Guide

Detailed guides for each major feature of the Doubt Discord Bot.

## Economy System

The economy system provides a virtual currency system for server members.

### Getting Started

1. Create an account with `/economy` and click **Create**
2. New accounts start with **$0 in wallet** and **$1000 in bank**
3. Use `/bal` to check your balance at any time

### Commands

- **`/deposit <amount>`** — Move money from wallet to bank. Use `all` to deposit everything.
- **`/withdraw <amount>`** — Move money from bank to wallet. Use `all` to withdraw everything.
- **`/beg`** — Random chance to gain or lose money (affects wallet only).
- **`/rob <user>`** — Attempt to rob another user:
  - Both users must have an account with at least $100 in their wallet
  - 50% success chance
  - Success: steal a random amount from the target's wallet
  - Failure: pay a penalty to the target (capped at your wallet balance)
  - 60-second cooldown between attempts
- **`/economy`** → **Delete** — Permanently delete your account

### Data Storage

Economy data is stored in the `ecoschemas` MongoDB collection with fields for Guild, User, Bank, and Wallet.

---

## Ticket System

A configurable support ticket system with HTML transcripts.

### Setup

1. Run `/setup` in your server
2. Select **Ticket** from the setup menu
3. Configure:
   - **Category** — stored by the setup wizard; current ticket creation code does not read this field
   - **Channel** — stored in ticket setup data; current ticket creation code reads this value as the parent category ID
   - **Role** — the support role that gets access to tickets
4. Post or maintain the ticket select menu separately. The setup wizard stores configuration but does not currently publish a ticket panel.

### How It Works

1. Members select a ticket type from the panel select menu
2. A modal appears asking for a reason/description
3. A private channel is created named `ticket-<username>`
4. The channel is visible only to the member, support role, and admins
5. When resolved, click the **Close Ticket** button
6. An HTML transcript is generated and DM'd to the member who clicked **Close Ticket**
7. The channel is deleted after 10 seconds

---

## Welcome System

Automated welcome messages and role assignment for new members.

### Setup

1. Run `/setup` in your server
2. Select **Welcome** from the setup menu
3. Configure:
   - **Channel** — where welcome messages are sent
   - **Message** — the welcome message template
   - **Rules** — rules channel reference
   - **Member Role** — auto-assigned role for human members
   - **Bot Role** — auto-assigned role for bot members

### Message Placeholders

| Placeholder | Replaced With |
|-------------|---------------|
| `{user}` | The new member's mention |
| `{rules}` | The rules channel mention |
| `{server}` | The server name |

### Limitations

The welcome system currently only fires for the support guild (`config.handler.guildId`). It checks `guild.id === config.handler.guildId` before sending welcome messages.

---

## AFK System

Let others know when you're away from the keyboard.

### Setting AFK

```
/afk set [message]
```

- Your nickname is prefixed with `[AFK]`
- An optional reason message can be provided
- Defaults to "No reason provided."

### Automatic AFK Notifications

When someone mentions an AFK user, the bot replies with an embed showing:
- The AFK user's display name
- Their AFK reason
- The notification auto-deletes after 10 seconds

### Returning from AFK

AFK is automatically cleared when the user sends a message. Alternatively:

```
/afk remove
```

- Your original nickname is restored
- A welcome-back message is shown (auto-deletes after 4 seconds)

---

## Join-to-Create (JTC)

Temporary voice channels that are created when a user joins a hub channel.

### How It Works

1. An admin creates a `jtcsetups` record with a hub voice channel and parent category
2. When a user joins the hub channel, a temporary voice channel is created
3. The channel is named after the user (e.g., `🔊 | Username`)
4. The user gets Manage Channels permission on their channel
5. When the owner leaves:
   - If others remain, ownership transfers to a random member
   - If empty, the channel is automatically deleted

### Configuration

JTC setup data is stored in the `jtcsetups` collection with the hub channel ID, category, and active temporary channels. The runtime `voiceStateUpdate` handler exists, but the `/setup` menu currently shows Join-to-Create as "will be added at a later date" and does not expose a working setup path. The handler also reads `data.UserLimit`, while `prisma/schema.prisma` does not define a `UserLimit` field, so treat JTC as partial/manual setup until that gap is closed.

---

## Rank / XP System

Per-guild leveling system with visual rank cards.

### Commands

- **`/rank info <user>`** — View a rank card showing current level and XP for a required server member
- **`/rank reset <user>`** — Reset a user's XP and level to defaults
- **`/rank set <user> <level>`** — Manually set a user's level

### Rank Cards

Rank cards are generated using the `canvacord` library and display:
- User avatar
- Current level
- XP progress
- Username
- Presence status, normalized through `src/utils/rankCardPresenceStatus.js` so missing presence data, unsupported statuses, and `invisible` render as `offline`

Enable the Discord Presence Intent if you expect live `online`, `idle`, or `dnd` statuses on rank cards. Without it, Discord may provide no presence object and the card will show `offline`.

### Data Storage

XP data is stored per user per guild in the `xps` collection with `guildId`, `userId`, `xp`, and `level` fields.

---

## Badge System

A global badge system managed by bot developers.

### Managing Badges (Developer Only)

- **`/badge create <name> <emoji>`** — Create a new badge with a name and emoji
- **`/badge edit <id> [name] [emoji]`** — Edit an existing badge
- **`/badge delete <id>`** — Delete a badge
- **`/badge give <id> <user>`** — Assign a badge to a user
- **`/badge take <id> <user>`** — Remove a badge from a user
- **`/badge list`** — List all available badges

### Viewing Badges

Badges appear on user info displays:
- `/user info` command
- **Info** context menu (right-click → Info)

---

## Moderation

### Available Actions

| Command | Description |
|---------|-------------|
| `/kick <user> [reason]` | Remove a member from the server |
| `/ban <user> [reason]` | Permanently ban a member |
| `/unban <user_id>` | Remove a ban by user ID |
| `/timeout <user> <duration> [reason]` | Temporarily mute a member (5s to 28 days) |

### AutoMod Rules

The `/automod` command creates Discord AutoMod rules:

- **Flagged Words** — Alerts in a channel when flagged content is detected
- **Spam Messages** — Detects and alerts on message spam
- **Mention Spam** — Blocks messages exceeding a mention threshold
- **Keyword** — Blocks messages containing a specific keyword

### Behavior

- Kick and ban commands attempt to DM the user before the action
- The bot requires appropriate permissions (Kick Members, Ban Members, Moderate Members)
- Timeout duration is parsed using the `ms` library (e.g., `5m`, `1h`, `7d`)

---

## Translation

Right-click any message → **Apps** → **Translate Message** to translate it to English using Google Translate. The translation appears as an ephemeral embed visible only to you.

---

## Health Check

The bot runs an Express server on port 8080 that responds to `GET /` with a status message. This can be used for uptime monitoring services.

```bash
curl http://localhost:8080/
# → Bot is online! Join our discord here: https://discord.gg/rmqAhQz2qu
```
