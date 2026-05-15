const { PrismaClient } = require("@prisma/client");
const config = require("../config");
const { log } = require("../functions");

const prisma = new PrismaClient({
  datasourceUrl: config.handler.mongodb.uri,
});

async function connectPrisma() {
  log("Connecting to MongoDB via Prisma...", "warn");
  try {
    await prisma.$connect();
    log("Prisma connected to MongoDB!", "done");
  } catch (err) {
    log(err, "err");
    throw err;
  }
}

module.exports = { prisma, connectPrisma };
