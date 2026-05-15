# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is **Doubt Discord Bot** — a multi-purpose Discord bot built with discord.js v14 and Express (health-check on port 8080). It uses MongoDB (Mongoose) for persistence and supports slash/prefix commands, moderation, economy, leveling, tickets, and more.

### Prerequisites

- **MongoDB**: Must be running on `localhost:27017`. In Cloud Agent environments, start via Docker:
  ```
  sudo dockerd &>/tmp/dockerd.log &
  sleep 3
  sudo docker start mongodb 2>/dev/null || sudo docker run -d --name mongodb -p 27017:27017 mongo:7
  ```
- **Discord bot token**: Set `DEV_TOKEN` in `.env` for the bot to log in. Without it, `client.login()` fails but the Express server still runs.
- **Config files**: `.env` (from `.env.example`) and `src/config.js` (from `src/example.config.js`) must exist. Both are `.gitignore`d.

### Common commands

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Run tests | `npm test` |
| Start bot (dev) | `npm run dev` (uses nodemon) |
| Start bot (prod) | `npm start` |

### Known issues

- `src/commands/slash/Economy/rob.js` has a pre-existing SyntaxError (`Unexpected token 'else'` at line 112) that prevents full command loading on startup. The Express health-check server still starts, but `client.login()` is never reached due to the error in the synchronous command-loading phase.
- No ESLint or other linter is configured in this repo.
- `package-lock.json` is `.gitignore`d, so `npm install` may resolve slightly different dependency versions across environments.

### Testing notes

- Tests are pure unit tests using Node's built-in test runner (`node --test`). They do not require MongoDB, Discord, or any external service.
- The health-check endpoint at `http://localhost:8080/` can be used to verify the Express server is running.
