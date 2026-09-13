const botStaffModel = require("../schemas/botStaff");
const badges = require("../schemas/badge");
const users = require("../schemas/userConfig");
const {
  BOT_STAFF_BADGE_ID,
  BOT_STAFF_BADGE_NAME,
  BOT_STAFF_BADGE_EMOJI,
} = require("../constants/botStaff");
const {
  isReservedBotStaffBadge,
  isStaffGateAllowed,
} = require("./botStaffAcl");
const {
  getLegacyStaffRoleIds,
  resolveMigrationGuildId,
  findMemberIdsWithRoles,
} = require("./botStaffMigration");

async function isStaffOnlyAllowed(userId, developerIds) {
  const isMember = await isBotStaff(userId);
  return isStaffGateAllowed(userId, developerIds, isMember);
}

async function isBotStaff(userId) {
  const record = await botStaffModel.findUnique({ where: { userId } });
  return record !== null;
}

async function countBotStaff() {
  return botStaffModel.count();
}

async function hasBotStaffConfigured() {
  return (await countBotStaff()) > 0;
}

async function migrateLegacyStaffRoles(client, addedBy, configOverride) {
  const activeConfig = configOverride ?? require("../config");
  const roleIds = getLegacyStaffRoleIds(activeConfig.moderation?.staffRoles);
  if (roleIds.length === 0) {
    return {
      migrated: [],
      reason: "no_legacy_roles",
      message:
        "No legacy `moderation.staffRoles` IDs found in config. Add staff with `/botstaff add` instead.",
    };
  }

  const guildId = resolveMigrationGuildId(
    activeConfig.variables?.supportServerId,
    activeConfig.handler?.guildId
  );
  if (!guildId) {
    return {
      migrated: [],
      reason: "no_guild_id",
      message:
        "Could not resolve a support guild (`variables.supportServerId` or `handler.guildId`).",
    };
  }

  const guild = await client.guilds.fetch(guildId).catch(() => null);
  if (!guild) {
    return {
      migrated: [],
      reason: "guild_not_found",
      message: `Bot is not in guild \`${guildId}\` or the guild could not be fetched.`,
    };
  }

  await guild.members.fetch();
  const memberIds = findMemberIdsWithRoles(
    guild.members.cache.map((member) => ({
      userId: member.id,
      roleIds: [...member.roles.cache.keys()],
    })),
    roleIds
  );

  const migrated = [];
  for (const userId of memberIds) {
    await addBotStaff(userId, addedBy);
    migrated.push(userId);
  }

  return {
    migrated,
    reason: migrated.length > 0 ? "ok" : "no_matching_members",
    roleIds,
    guildId,
    message:
      migrated.length > 0
        ? `Migrated ${migrated.length} member(s) from legacy staff roles into BotStaff.`
        : "No members in the support guild currently hold the legacy staff roles.",
  };
}

async function ensureBotStaffBadgeCatalog() {
  const existing = await badges.findFirst({
    where: { badgeId: BOT_STAFF_BADGE_ID },
  });
  if (existing) {
    return existing;
  }
  return badges.create({
    data: {
      badgeId: BOT_STAFF_BADGE_ID,
      name: BOT_STAFF_BADGE_NAME,
      emoji: BOT_STAFF_BADGE_EMOJI,
      animated: false,
      emojiId: null,
      createdAt: String(Date.now()),
    },
  });
}

async function getOrCreateUserRecord(userId) {
  return (
    (await users.findFirst({ where: { user: userId } })) ||
    (await users.create({ data: { user: userId } }))
  );
}

async function giveBotStaffBadge(userId) {
  await ensureBotStaffBadgeCatalog();
  const userData = await getOrCreateUserRecord(userId);
  const currentBadges = userData.badges ?? [];
  if (currentBadges.includes(BOT_STAFF_BADGE_ID)) {
    return userData;
  }
  return users.update({
    where: { id: userData.id },
    data: { badges: [...currentBadges, BOT_STAFF_BADGE_ID] },
  });
}

async function takeBotStaffBadge(userId) {
  const userData = await users.findFirst({ where: { user: userId } });
  if (!userData?.badges?.includes(BOT_STAFF_BADGE_ID)) {
    return userData;
  }
  return users.update({
    where: { id: userData.id },
    data: {
      badges: userData.badges.filter((id) => id !== BOT_STAFF_BADGE_ID),
    },
  });
}

async function addBotStaff(userId, addedBy) {
  await ensureBotStaffBadgeCatalog();
  const record = await botStaffModel.upsert({
    where: { userId },
    create: { userId, addedBy },
    update: { addedBy },
  });
  await giveBotStaffBadge(userId);
  return record;
}

async function removeBotStaff(userId) {
  const record = await botStaffModel.findUnique({ where: { userId } });
  if (!record) {
    return null;
  }
  await botStaffModel.delete({ where: { userId } });
  await takeBotStaffBadge(userId);
  return record;
}

module.exports = {
  BOT_STAFF_BADGE_ID,
  BOT_STAFF_BADGE_NAME,
  BOT_STAFF_BADGE_EMOJI,
  isReservedBotStaffBadge,
  isStaffOnlyAllowed,
  isBotStaff,
  countBotStaff,
  hasBotStaffConfigured,
  migrateLegacyStaffRoles,
  ensureBotStaffBadgeCatalog,
  giveBotStaffBadge,
  takeBotStaffBadge,
  addBotStaff,
  removeBotStaff,
};
