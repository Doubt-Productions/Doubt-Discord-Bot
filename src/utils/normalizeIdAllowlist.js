/**
 * Coerces config allowlists to string arrays. If the value is not an array
 * (e.g. a single ID string from a bad env merge), callers must not use
 * String.prototype.includes semantics, which would allow substring matches.
 */
function normalizeIdAllowlist(value) {
  return Array.isArray(value) ? value : [];
}

module.exports = { normalizeIdAllowlist };
