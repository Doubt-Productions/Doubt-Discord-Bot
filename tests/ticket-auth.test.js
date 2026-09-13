const { test } = require("node:test");
const assert = require("node:assert");
const { canCloseTicket } = require("../src/utils/ticketAuth");
const { PermissionFlagsBits } = require("discord.js");

function mockMember({ permissions = [], roles = [], id = "user-1" }) {
  return {
    id,
    permissions: {
      has: (perm) => permissions.includes(perm),
    },
    roles: {
      cache: {
        some: (fn) => roles.some((roleId) => fn({ id: roleId })),
      },
    },
  };
}

function mockChannel({ openerId = null } = {}) {
  const overwrites = new Map();
  if (openerId) {
    overwrites.set(openerId, {
      allow: { has: (perm) => perm === PermissionFlagsBits.ViewChannel },
    });
  }
  return { permissionOverwrites: { cache: overwrites } };
}

test("ticket opener can close their ticket", () => {
  const member = mockMember({ id: "opener-1" });
  const channel = mockChannel({ openerId: "opener-1" });
  assert.strictEqual(canCloseTicket(member, channel, { Role: "staff-role" }), true);
});

test("staff role can close tickets", () => {
  const member = mockMember({ roles: ["staff-role"] });
  const channel = mockChannel();
  assert.strictEqual(canCloseTicket(member, channel, { Role: "staff-role" }), true);
});

test("random member cannot close tickets", () => {
  const member = mockMember({ id: "intruder" });
  const channel = mockChannel({ openerId: "someone-else" });
  assert.strictEqual(canCloseTicket(member, channel, { Role: "staff-role" }), false);
});

test("ManageChannels permission allows close", () => {
  const member = mockMember({
    permissions: [PermissionFlagsBits.ManageChannels],
  });
  const channel = mockChannel();
  assert.strictEqual(canCloseTicket(member, channel, null), true);
});
