const { PrismaClient } = require("@prisma/client");
const config = require("../config");
const { log } = require("../functions");
const { resolveMongoUri } = require("../utils/resolveMongoUri");

const mongoEnvVar =
  process.env.PRODUCTION === "true" ? "MONGODB_URI" : "DEV_MONGODB_URI";

const { uri: datasourceUrl, rewritten } = resolveMongoUri(
  config.handler.mongodb.uri,
  config.variables.dbName,
  mongoEnvVar
);

if (rewritten) {
  log(
    `MongoDB URI had no database name; appended "${config.variables.dbName || "development"}" from config.variables.dbName.`,
    "warn"
  );
}

// Prisma schema reads env("DATABASE_URL"); keep it aligned with the resolved URI.
process.env.DATABASE_URL = datasourceUrl;

const prisma = new PrismaClient({
  datasourceUrl,
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
