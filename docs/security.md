# Security

This page documents permission gates, sandboxing, and authorization checks introduced in the security hardening work merged in [PR #130](https://github.com/Doubt-Productions/Doubt-Discord-Bot/pull/130). Behavior described here is verified from source on `main`.

For general configuration of developer and staff allowlists, see [Configuration](configuration.md).

## Slash command Discord permissions

Several slash commands set Discord `default_member_permissions` when registered. Discord hides these commands from members who lack the permission in the slash command picker. The bot also enforces the same permissions at runtime through each command module's `userPermissions` array and the validators in `src/events/validations/chatInputCommandValidator.js`.

| Command | Discord permission |
|---------|-------------------|
| `/kick` | Kick Members |
| `/ban` | Ban Members |
| `/unban` | Ban Members |
| `/timeout` | Moderate Members |
| `/automod` (all subcommands) | Manage Server |
| `/setup` | Manage Server |
| `/embedcreator` | Manage Messages |

Commands without `default_member_permissions` (economy, general, info, utility `/ping`, and so on) remain visible to all members who can use slash commands in the guild.

### Syncing permission changes after deploy

Ready-time registration in `src/events/ready/registerCommands.js` creates or edits guild application commands and includes `default_member_permissions` from each command's `SlashCommandBuilder`. `src/utils/commandComparing.js` treats permission changes as a diff that triggers an edit.

**After deploying code that changes slash-command permission requirements, restart the bot.** Registration runs on the ready event; a restart ensures Discord receives updated `default_member_permissions` values. Without a restart, members may still see stale permission visibility until the next ready-time sync.

## Developer eval sandbox

`/eval` (developer slash command) and `?eval` (prefix alias `?e`) execute code through `src/utils/safeEval.js`. Both paths are developer-only:

- **Slash `/eval`**: gated by `devCommandValidator.js`. The user's Discord ID must appear in `config.moderation.developers`. If the allowlist is missing or empty, the command is denied.
- **Prefix `?eval`**: gated by `messageCreate.js` when `data.developers: true`. The author must be in `config.moderation.developers`.

`/badge` and other commands under `src/commands/devOnly/**` are developer-allowlist gated but do **not** use the eval sandbox.

### Sandbox rules

`safeEval` runs submitted code in an isolated Node.js VM context (`vm.createContext` + `runInContext`) with these constraints:

| Constraint | Value |
|------------|-------|
| Execution timeout | 3 seconds |
| Maximum code length | 2000 characters |
| Blocked identifiers | `process`, `require`, `module`, `exports`, `__dirname`, `__filename`, `global`, `globalThis`, `Buffer`, `child_process`, `fs`, `net`, `http`, `https`, `worker_threads` |

Blocked identifiers are matched as whole words in the submitted source. A match fails closed with an error before execution.

The sandbox exposes a limited `console` object (logs are prefixed with `[eval]` in the bot process) plus caller-provided context:

- Slash `/eval`: `{ client, interaction }`
- Prefix `?eval`: `{ client, message }`

Eval is a developer convenience, not a general-purpose scripting surface. Keep `config.moderation.developers` limited to trusted operator accounts.

## Ticket close authorization

The **Close Ticket** button (`src/components/buttons/ticket-close.js`) calls `canCloseTicket` from `src/utils/ticketAuth.js`. A member may close a ticket only if **any** of the following is true:

1. They have the **Manage Channels** guild permission.
2. They have the guild's configured **ticket support role** (`Role` on the ticket schema for that guild).
3. They are the **ticket opener**, detected by a channel permission overwrite that grants them `ViewChannel` on the ticket channel.

Everyone else receives an ephemeral reply: "You do not have permission to close this ticket."

Opening a ticket (panel select menu and modal) does not use this check; any member who can see the ticket panel can open a ticket subject to the usual one-open-ticket-per-user rule in `ticket-modal.js`.

## Setup wizard authorization

`/setup` requires **Manage Server** at both the Discord API level (`default_member_permissions`) and runtime (`userPermissions` on the command module).

Follow-up setup interactions enforce the same permission and bind UI collectors to the user who started setup:

- `setupSSM`, `welcomeSSM`, and `ticketSSM` call `denyUnlessManageGuild` from `src/utils/setupGuard.js` before handling the interaction.
- Channel and role collectors in `welcomeSSM.js` and `ticketSSM.js` use `setupComponentFilter(interaction, customId)`, which accepts input only when `i.user.id === interaction.user.id` and the component `customId` matches.

Another guild member cannot complete or hijack another user's in-progress setup flow, even if they can see the setup message.

## Defense in depth summary

| Surface | Primary gate |
|---------|----------------|
| Moderation slash commands | Discord `default_member_permissions` + runtime `userPermissions` |
| `/setup` and setup components | Manage Server + initiating-user collector binding |
| Ticket close button | Opener, support role, or Manage Channels |
| `/eval` and `?eval` | Developer allowlist + VM sandbox |
| Developer commands (`/badge`, `/deploy`, …) | Developer allowlist (`config.moderation.developers`) |

Regression tests for eval sandboxing and ticket close rules live in `tests/safe-eval.test.js` and `tests/ticket-auth.test.js`.
