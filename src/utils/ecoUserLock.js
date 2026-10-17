/** In-memory per-user lock for economy balance writes (deposit, withdraw, rob). */
const held = new Set();

function tryAcquire(userId) {
  if (held.has(userId)) {
    return false;
  }
  held.add(userId);
  return true;
}

/** Acquire locks for multiple users in a stable order to avoid deadlocks. */
function tryAcquireAll(userIds) {
  const ordered = [...new Set(userIds)].sort();
  for (const userId of ordered) {
    if (!tryAcquire(userId)) {
      for (const heldId of ordered) {
        if (heldId === userId) {
          break;
        }
        release(heldId);
      }
      return false;
    }
  }
  return true;
}

function release(userId) {
  held.delete(userId);
}

function releaseAll(userIds) {
  for (const userId of userIds) {
    release(userId);
  }
}

module.exports = { tryAcquire, tryAcquireAll, release, releaseAll };
