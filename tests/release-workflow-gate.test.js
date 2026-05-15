/**
 * Regression: .github/workflows/release.yml must expose steps.check.outputs.needed
 * and gate release steps on it. A bad merge once left id: check writing "changed",
 * referenced steps.changed (nonexistent), and never set "needed", so no release
 * steps ever ran on pushes to main.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("release workflow gates on steps.check.outputs.needed only", () => {
  const yml = fs.readFileSync(
    path.join(__dirname, "../.github/workflows/release.yml"),
    "utf8"
  );

  assert.ok(
    yml.includes('id: check'),
    "expected a single check step with id: check"
  );
  assert.ok(
    yml.includes('echo "needed=true"') && yml.includes('echo "needed=false"'),
    "expected check step to write needed=true/false to GITHUB_OUTPUT"
  );
  assert.ok(
    yml.includes("steps.check.outputs.needed == 'true'"),
    "expected downstream if conditions to use steps.check.outputs.needed"
  );
  assert.ok(
    !yml.includes("steps.changed"),
    "must not reference nonexistent steps.changed"
  );
  assert.ok(
    !yml.includes('echo "changed=true"') && !yml.includes('echo "changed=false"'),
    "check step must not write changed= to GITHUB_OUTPUT (would leave needed unset)"
  );
});
