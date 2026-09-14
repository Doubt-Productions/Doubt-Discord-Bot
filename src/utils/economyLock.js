const locks = new Set();

function economyLockKey(guildId, userId) {
  return `${guildId}:${userId}`;
}

function acquireEconomyLock(key) {
  if (locks.has(key)) return false;
  locks.add(key);
  return true;
}

function releaseEconomyLock(key) {
  locks.delete(key);
}

module.exports = {
  economyLockKey,
  acquireEconomyLock,
  releaseEconomyLock,
};
