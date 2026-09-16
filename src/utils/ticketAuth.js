const { PermissionFlagsBits } = require("discord.js");
const { normalizeIdAllowlist } = require("./normalizeIdAllowlist");

/**
 * @param {import("discord.js").GuildMember} member
 * @param {import("discord.js").GuildChannel} channel
 * @param {{ Role?: string | null } | null} ticketData
 * @returns {boolean}
 */
function canCloseTicket(member, channel, ticketData) {
  if (!member || !channel) return false;

  if (member.permissions.has(PermissionFlagsBits.ManageChannels)) {
    return true;
  }

  const staffRoleIds = normalizeIdAllowlist(
    ticketData?.Role ? [ticketData.Role] : []
  );
  if (
    staffRoleIds.length > 0 &&
    member.roles.cache.some((role) => staffRoleIds.includes(role.id))
  ) {
    return true;
  }

  const openerOverwrite = channel.permissionOverwrites?.cache?.get(member.id);
  if (openerOverwrite?.allow?.has(PermissionFlagsBits.ViewChannel)) {
    return true;
  }

  return false;
}

module.exports = { canCloseTicket };
