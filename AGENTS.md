# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is **Doubt Discord Bot** — a multi-purpose Discord bot built with discord.js v14 and Express (health-check on port 8080). It uses MongoDB via **Prisma v6** for persistence and supports slash/prefix commands, moderation, economy, manual rank cards, tickets, and more.

### Prerequisites

- **MongoDB**: Must be running and reachable by the URI selected in `src/config.js`. For local development, set `DEV_MONGODB_URI=mongodb://127.0.0.1:27017/doubt` and leave `PRODUCTION` unset or empty unless you have reviewed the generated config. A literal `PRODUCTION=false` string still selects `MONGODB_URI` for runtime Prisma connections in `src/example.config.js`. In Cloud Agent environments, start MongoDB via Docker:
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

### Prisma notes

- The Prisma schema is at `prisma/schema.prisma`. After schema changes, run `npx prisma generate` to regenerate the client.
- The Prisma client singleton is in `src/handlers/prisma.js` and reads the MongoDB URI from `config.handler.mongodb.uri`.
- `DATABASE_URL` in `.env` is used only by `prisma` CLI tools (e.g., `prisma db push`). The runtime client uses the URI from config.
- MongoDB is schema-less so `prisma migrate` commands do NOT work. Use `prisma db push` to sync indexes.

### Known issues

- No ESLint or other linter is configured in this repo.
- `package-lock.json` is `.gitignore`d, so `npm install` may resolve slightly different dependency versions across environments.

### Testing notes

- Tests are pure unit tests using Node's built-in test runner (`node --test`). They do not require MongoDB, Discord, or any external service. `tests/rob-module-loads.test.js` runs `node --check` on `rob.js` so a syntax regression fails CI without installing `discord.js`.
- The health-check endpoint at `http://localhost:8080/` can be used to verify the Express server is running.
