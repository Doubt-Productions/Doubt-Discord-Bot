/**
 * Resolves a Discord presence for canvacord Rank#setStatus.
 * Without GuildPresences, member.presence is often null. Unknown strings throw in canvacord.
 *
 * @param {import("discord.js").GuildMember | null | undefined} member
 * @returns {"online"|"idle"|"dnd"|"offline"|"streaming"}
 */
module.exports = function rankCardPresenceStatus(member) {
  const status = member?.presence?.status;
  if (
    status === "online" ||
    status === "idle" ||
    status === "dnd" ||
    status === "offline" ||
    status === "streaming"
  ) {
    return status;
  }
  return "offline";
};
