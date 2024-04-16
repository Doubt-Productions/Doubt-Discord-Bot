require("dotenv").config();
const ExtendedClient = require("./class/ExtendedClient");
const server = require("./server");
const { shopData, shopImage } = require("./functions");

const client = new ExtendedClient();

client.start();

setInterval(async () => {
  const data = await shopData();
  console.log(data);
  const image = await shopImage(data);
  client.channels.cache.get("1107102970312659004").send({
    content: `**Fortnite Item Shop**`,
    files: [image],
  });
}, 10000);

// Start the express server for ping and uptime.
server();

// Handles errors and avoids crashes, better to not remove them.
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);
