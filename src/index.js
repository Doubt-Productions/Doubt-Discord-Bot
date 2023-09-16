require("dotenv").config();
const ExtendedClient = require("./class/ExtendedClient");
const server = require("./server");

const client = new ExtendedClient();

client.start();


// Start the express server for ping and uptime.
server();

// Handles errors and avoids crashes, better to not remove them.
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);
