const botStaffModel = require("../schemas/botStaff");
const botStaffRemovalModel = require("../schemas/botStaffRemoval");
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

async function getRemovedBotStaffUserIds() {
  const removals = await botStaffRemovalModel.findMany({
    select: { userId: true },
  });
  return new Set(removals.map((entry) => entry.userId));
}

async function recordBotStaffRemoval(userId, removedBy) {
  return botStaffRemovalModel.upsert({
    where: { userId },
    create: { userId, removedBy },
    update: { removedBy, removedAt: new Date() },
  });
}

async function clearBotStaffRemoval(userId) {
  await botStaffRemovalModel.deleteMany({ where: { userId } });
}

async function migrateLegacyStaffRoles(client, addedBy, options = {}) {
  const { configOverride, force = false } = options;

  const existingCount = await countBotStaff();
  if (existingCount > 0 && !force) {
    return {
      migrated: [],
      skipped: [],
      reason: "botstaff_already_configured",
      message:
        "BotStaff already has entries. Run `/botstaff migrate` with `force: true` only if you intend to re-import legacy roles. " +
        "Removed users and bots are always skipped.",
    };
  }

  const activeConfig = configOverride ?? require("../config");
  const roleIds = getLegacyStaffRoleIds(activeConfig.moderation?.staffRoles);
  if (roleIds.length === 0) {
    return {
      migrated: [],
      skipped: [],
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
      skipped: [],
      reason: "no_guild_id",
      message:
        "Could not resolve a support guild (`variables.supportServerId` or `handler.guildId`).",
    };
  }

  const guild = await client.guilds.fetch(guildId).catch(() => null);
  if (!guild) {
    return {
      migrated: [],
      skipped: [],
      reason: "guild_not_found",
      message: `Bot is not in guild \`${guildId}\` or the guild could not be fetched.`,
    };
  }

  await guild.members.fetch();
  const removedUserIds = await getRemovedBotStaffUserIds();
  const memberIds = findMemberIdsWithRoles(
    guild.members.cache.map((member) => ({
      userId: member.id,
      isBot: member.user.bot,
      roleIds: [...member.roles.cache.keys()],
    })),
    roleIds
  );

  const migrated = [];
  const skipped = [];
  for (const userId of memberIds) {
    if (removedUserIds.has(userId)) {
      skipped.push(userId);
      continue;
    }

    const alreadyStaff = await isBotStaff(userId);
    if (alreadyStaff) {
      continue;
    }

    await addBotStaff(userId, addedBy);
    migrated.push(userId);
  }

  return {
    migrated,
    skipped,
    reason: migrated.length > 0 ? "ok" : "no_matching_members",
    roleIds,
    guildId,
    message:
      migrated.length > 0
        ? `Migrated ${migrated.length} member(s) from legacy staff roles into BotStaff.` +
          (skipped.length > 0
            ? ` Skipped ${skipped.length} previously removed user(s).`
            : "")
        : skipped.length > 0
          ? `No new members migrated. Skipped ${skipped.length} previously removed user(s) who still hold legacy roles.`
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
  await clearBotStaffRemoval(userId);
  await ensureBotStaffBadgeCatalog();
  const record = await botStaffModel.upsert({
    where: { userId },
    create: { userId, addedBy },
    update: { addedBy, addedAt: new Date() },
  });
  await giveBotStaffBadge(userId);
  return record;
}

async function removeBotStaff(userId, removedBy) {
  const record = await botStaffModel.findUnique({ where: { userId } });
  if (!record) {
    return null;
  }
  await botStaffModel.delete({ where: { userId } });
  await recordBotStaffRemoval(userId, removedBy);
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
