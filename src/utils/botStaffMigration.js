const { normalizeIdAllowlist } = require("./normalizeIdAllowlist");

/**
 * Legacy `moderation.staffRoles` IDs still present in an operator config during cutover.
 */
function getLegacyStaffRoleIds(staffRolesConfig) {
  return normalizeIdAllowlist(staffRolesConfig).filter((id) => id.length > 0);
}

function resolveMigrationGuildId(supportServerId, handlerGuildId) {
  const guildId = supportServerId || handlerGuildId || "";
  return guildId.length > 0 ? guildId : null;
}

/**
 * @param {Iterable<{ id?: string, userId?: string, roleIds?: string[], isBot?: boolean }>} members
 */
function findMemberIdsWithRoles(members, roleIds) {
  const roleIdSet = new Set(roleIds);
  const userIds = new Set();

  for (const member of members) {
    if (member.isBot === true) {
      continue;
    }

    const memberRoleIds = member.roleIds ?? [];
    if (memberRoleIds.some((roleId) => roleIdSet.has(roleId))) {
      const userId = member.userId ?? member.id;
      if (userId) {
        userIds.add(userId);
      }
    }
  }

  return [...userIds];
}

module.exports = {
  getLegacyStaffRoleIds,
  resolveMigrationGuildId,
  findMemberIdsWithRoles,
};
