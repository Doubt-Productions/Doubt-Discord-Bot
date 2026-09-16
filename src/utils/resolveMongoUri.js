const MONGODB_URI_SCHEME = /^mongodb(\+srv)?:\/\//;

/**
 * Returns the database segment from a MongoDB URI using string parsing so
 * replica-set host lists (commas) and credentials are not mangled by URL().
 *
 * @param {string} uri
 * @returns {string}
 */
function extractDatabaseName(uri) {
  const schemeMatch = uri.match(MONGODB_URI_SCHEME);
  if (!schemeMatch) {
    return "";
  }

  const afterScheme = uri.slice(schemeMatch[0].length);
  const atIndex = afterScheme.indexOf("@");
  const hostsAndPath = atIndex === -1 ? afterScheme : afterScheme.slice(atIndex + 1);

  const slashIndex = hostsAndPath.indexOf("/");
  if (slashIndex === -1) {
    return "";
  }

  const afterSlash = hostsAndPath.slice(slashIndex + 1);
  const dbPart = afterSlash.split("?")[0];
  return dbPart.replace(/\/+$/g, "");
}

/**
 * Appends a database name before any query string without re-encoding credentials.
 *
 * @param {string} uri
 * @param {string} dbName
 * @returns {string}
 */
function appendDatabaseName(uri, dbName) {
  const qIndex = uri.indexOf("?");
  const base = qIndex === -1 ? uri : uri.slice(0, qIndex);
  const query = qIndex === -1 ? "" : uri.slice(qIndex);
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${normalizedBase}/${dbName}${query}`;
}

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

  const trimmed = String(uri).trim();
  if (!MONGODB_URI_SCHEME.test(trimmed)) {
    throw new Error(
      `MongoDB URI in ${envVarName} must start with mongodb:// or mongodb+srv://`
    );
  }

  const resolvedDbName = dbName && String(dbName).trim()
    ? String(dbName).trim()
    : "development";

  const existingDb = extractDatabaseName(trimmed);
  if (existingDb) {
    return { uri: trimmed, rewritten: false };
  }

  return {
    uri: appendDatabaseName(trimmed, resolvedDbName),
    rewritten: true,
  };
}

module.exports = { resolveMongoUri, extractDatabaseName, appendDatabaseName };
