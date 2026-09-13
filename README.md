<!--- README -->

<!--- Information -->
<br />
<div align="center">

<a href="https://github.com/Doubt-Productions/Doubt-Discord-Bot">
  <img src="https://github.com/Doubt-Productions/Assets/blob/main/Doubt%20Logo.jpg" alt="Logo" width="128" height="128" />
</a>

<h3 align="center">Doubt Discord Bot</h3>
<h4 align="center">Made For <a href="https://github.com/Doubt-Productions">Doubt Productions</a><br>By <a href="https://github.com/zVapor-Dev">zVapor-Dev</a> (Vapor)</h4>

A multi-purpose bot with lots of features!<br/>
This project is currently a WIP!

</div>

<!--- Documentation -->
## 📚 Documentation

**Canonical operator and user documentation:** [https://doubtbot.eu/docs](https://doubtbot.eu/docs)

| Topic | Link |
|-------|------|
| Getting started | [doubtbot.eu/docs/get-started/getting-started](https://doubtbot.eu/docs/get-started/getting-started) |
| Security | [doubtbot.eu/docs/security](https://doubtbot.eu/docs/security) |
| Commands | [doubtbot.eu/docs/guides/commands](https://doubtbot.eu/docs/guides/commands) |

The in-repo [`docs/`](docs/) folder may still be useful for contributors, but it is not the primary public documentation.

<!--- Credits -->
## ℹ️ Credits
```md
- zVapor-Dev (Vapor) (General data + Commands beloning to init commit)
```

`IF YOU ADD SOMETHING TO THE REPO ADD YOURSELF TO THE CREDITS!`

<!--- Installation -->
## 🔌 Installation
```md
- Install Node.js and npm.
- Run npm i.
- Copy .env.example to .env and fill in the Discord and MongoDB values.
- Copy src/example.config.js to src/config.js and fill in guild, channel, developer, and staff role IDs.
- Prefix commands load from `src/commands/prefix/**` but are disabled by default (`handler.commands.prefix: false`). Set `handler.commands.prefix: true` in `src/config.js` to enable them. The default prefix is `?`, and the Discord **Message Content Intent** must be enabled for the bot application in the Discord Developer Portal.
- Set DATABASE_URL for Prisma CLI commands, then run npx prisma generate after install or schema changes.
- Run npm run dev to start the bot with nodemon, or npm start to run it with node.
- Run npm test before opening a PR.
```

<!--- Usage -->
## 🔍 Usage

This is a Discord bot application, not an importable npm module. It starts from `src/index.js`, logs in with the token selected by `src/config.js`, connects to MongoDB through Prisma when enabled, registers commands/components/events, and exposes an unauthenticated health endpoint on `0.0.0.0:8080` that returns a plain-text online message plus Discord invite link.

For setup constraints, command deployment, permission gates, economy behavior, and troubleshooting, see the [public documentation](https://doubtbot.eu/docs). Contributors may also reference [`docs/engineering-guide.md`](docs/engineering-guide.md) in this repository.

