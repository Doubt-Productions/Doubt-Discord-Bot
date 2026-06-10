/**
 * Regression: ticket channels must be created under the configured category,
 * not the panel text channel stored in Ticket.Channel.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("ticket modal uses Category field as channel parent", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/components/modals/ticket-modal.js"),
    "utf8"
  );

  assert.ok(
    src.includes("data.Category"),
    "ticket modal should read Category for the parent category id"
  );
  assert.ok(
    !src.includes("data.Channel"),
    "ticket modal must not use Channel (panel channel) as parent"
  );
  assert.ok(
    src.includes("data?.Category"),
    "ticket modal should guard missing ticket setup"
  );
});
