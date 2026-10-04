/** In-memory per-user lock for economy balance writes (deposit, withdraw, rob). */
const held = new Set();

function tryAcquire(userId) {
  if (held.has(userId)) {
    return false;
  }
  held.add(userId);
  return true;
}

function release(userId) {
  held.delete(userId);
}

module.exports = { tryAcquire, release };
