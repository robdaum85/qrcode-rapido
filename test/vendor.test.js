const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const vendorFile = path.join(root, "vendor", "qrcode.min.js");
const hashFile = path.join(root, "vendor", "qrcode.sha256");

test("a biblioteca incorporada corresponde ao SHA-256 versionado", () => {
  const library = fs.readFileSync(vendorFile);
  const expectedHash = fs.readFileSync(hashFile, "utf8").trim();
  const actualHash = crypto
    .createHash("sha256")
    .update(library)
    .digest("hex");

  assert.match(expectedHash, /^[a-f0-9]{64}$/);
  assert.equal(
    actualHash,
    expectedHash,
    "vendor/qrcode.min.js foi alterado sem atualizar o hash de integridade"
  );
});
