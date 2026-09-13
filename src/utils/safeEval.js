const vm = require("vm");

const BLOCKED_IDENTIFIERS = new Set([
  "process",
  "require",
  "module",
  "exports",
  "__dirname",
  "__filename",
  "global",
  "globalThis",
  "Buffer",
  "child_process",
  "fs",
  "net",
  "http",
  "https",
  "worker_threads",
  "constructor",
  "__proto__",
  "prototype",
]);

/**
 * Fail-closed developer eval: runs code in an isolated VM with a short timeout.
 * @param {string} code
 * @param {Record<string, unknown>} [extraContext]
 * @returns {Promise<unknown>}
 */
async function safeEval(code, extraContext = {}) {
  if (typeof code !== "string" || code.length === 0) {
    throw new Error("Code must be a non-empty string.");
  }

  if (code.length > 2000) {
    throw new Error("Code exceeds the 2000 character limit.");
  }

  for (const token of BLOCKED_IDENTIFIERS) {
    const pattern = new RegExp(`\\b${token}\\b`);
    if (pattern.test(code)) {
      throw new Error(`Use of '${token}' is not allowed.`);
    }
  }

  if (/\.constructor\b/.test(code)) {
    throw new Error("Use of '.constructor' is not allowed.");
  }

  const sandbox = Object.create(null);
  sandbox.console = {
    log: (...args) => console.log("[eval]", ...args),
    info: (...args) => console.info("[eval]", ...args),
    warn: (...args) => console.warn("[eval]", ...args),
    error: (...args) => console.error("[eval]", ...args),
  };
  Object.assign(sandbox, extraContext);

  vm.createContext(sandbox);

  const script = new vm.Script(code, { filename: "eval.js" });
  const result = script.runInContext(sandbox, { timeout: 3000 });

  return result instanceof Promise ? await result : result;
}

module.exports = { safeEval };
