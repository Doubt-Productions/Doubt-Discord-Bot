const { ShardingManager } = require("discord.js");
const config = require("../../config/config.json");
require("colors");

const manager = new ShardingManager("./index.js", {
  totalShards: "auto",
  token: config.Client.TOKEN,
});

console.log(`0------------------| Strating Shards System`.blue);

manager.on("shardCreate", async (shard) => {
  console.log(`[SHARDING] Launched shard ${shard.id}`.green);

  console.log(`0------------------| Log Events`.blue);
});

manager.spawn();
