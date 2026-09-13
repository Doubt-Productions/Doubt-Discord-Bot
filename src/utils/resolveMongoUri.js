/**
 * Ensures a MongoDB connection URI includes a database name in the path.
 * When the path is missing or empty, appends dbName (defaults to "development").
 *
 * @param {string|undefined|null} uri
 * @param {string|undefined|null} dbName
 * @param {string} envVarName - Env var name shown when uri is missing (e.g. MONGODB_URI)
 * @returns {{ uri: string, rewritten: boolean }}
 */
function resolveMongoUri(uri, dbName, envVarName) {
  if (!uri || !String(uri).trim()) {
    throw new Error(
      `MongoDB URI is missing or blank. Set ${envVarName} in your environment or .env file.`
    );
  }

  const resolvedDbName = dbName && String(dbName).trim()
    ? String(dbName).trim()
    : "development";

  let url;
  try {
    url = new URL(String(uri).trim());
  } catch (err) {
    throw new Error(
      `MongoDB URI in ${envVarName} is not a valid URL: ${err.message}`
    );
  }

  const existingDb = url.pathname.replace(/^\/+|\/+$/g, "");
  if (existingDb) {
    return { uri: String(uri).trim(), rewritten: false };
  }

  url.pathname = `/${resolvedDbName}`;
  return { uri: url.toString(), rewritten: true };
}

module.exports = { resolveMongoUri };
