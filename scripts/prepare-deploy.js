const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "dist");
const publishEntries = [
  ".well-known",
  "assets",
  "vendor",
  "_redirects",
  "clipboard-utils.js",
  "index.html",
  "LICENSE",
  "privacidade.html",
  "scripts.js",
  "SECURITY.md",
  "sobre-qr-estatico.html",
  "styles.css",
  "THIRD_PARTY_NOTICES.md",
  "url-utils.js"
];

if (path.dirname(output) !== root || path.basename(output) !== "dist") {
  throw new Error("Diretório de saída inválido.");
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const entry of publishEntries) {
  const source = path.join(root, entry);
  const destination = path.join(output, entry);

  if (!fs.existsSync(source)) {
    throw new Error(`Arquivo obrigatório ausente: ${entry}`);
  }

  fs.cpSync(source, destination, { recursive: true });
}

console.log(`Deploy preparado em dist/ com ${publishEntries.length} entradas.`);
