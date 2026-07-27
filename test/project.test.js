const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("carrega a biblioteca de QR Code hospedada localmente", () => {
  const html = read("index.html");

  assert.match(html, /src="vendor\/qrcode\.min\.js"/);
  assert.doesNotMatch(html, /cdn\.jsdelivr\.net/);
  assert.ok(fs.existsSync(path.join(root, "vendor", "qrcode.min.js")));
});

test("mantém zona silenciosa de quatro módulos", () => {
  assert.match(read("scripts.js"), /margin:\s*4/);
});

test("oferece PNG em alta resolução e SVG", () => {
  const script = read("scripts.js");

  assert.match(script, /createPngBlob\(2048\)/);
  assert.match(script, /type:\s*"svg"/);
  assert.match(script, /qr-code-estatico-2048px\.png/);
  assert.match(script, /qr-code-estatico\.svg/);
});

test("usa correção de erro Q, adequada para impressão", () => {
  assert.match(read("scripts.js"), /errorCorrectionLevel:\s*"Q"/);
});

test("a biblioteca local gera um SVG válido", async () => {
  const context = {};
  vm.runInNewContext(read("vendor/qrcode.min.js"), context);

  const svg = await context.QRCode.toString(
    "https://exemplo.com/",
    { type: "svg", margin: 4 }
  );

  assert.match(svg, /^<svg /);
  assert.match(svg, /viewBox=/);
  assert.match(svg, /shape-rendering="crispEdges"/);
});

test("inclui metadados sociais e favicon", () => {
  const html = read("index.html");

  assert.match(html, /property="og:title"/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /name="twitter:card"/);
  assert.match(html, /rel="icon"/);
  assert.ok(fs.existsSync(path.join(root, "assets", "favicon.svg")));
  assert.ok(fs.existsSync(path.join(root, "assets", "og-image.png")));
});

test("inclui licença do projeto e aviso da dependência", () => {
  assert.ok(fs.existsSync(path.join(root, "LICENSE")));
  assert.ok(fs.existsSync(path.join(root, "THIRD_PARTY_NOTICES.md")));
  assert.ok(fs.existsSync(path.join(root, "vendor", "qrcode.LICENSE")));
});

test("inclui governança de contribuição", () => {
  assert.ok(fs.existsSync(path.join(root, "CONTRIBUTING.md")));
  assert.ok(
    fs.existsSync(
      path.join(root, ".github", "ISSUE_TEMPLATE", "bug_report.md")
    )
  );
  assert.ok(
    fs.existsSync(
      path.join(root, ".github", "ISSUE_TEMPLATE", "feature_request.md")
    )
  );
  assert.ok(
    fs.existsSync(path.join(root, ".github", "PULL_REQUEST_TEMPLATE.md"))
  );
});

test("inclui página educativa com canonical e navegação bidirecional", () => {
  const index = read("index.html");
  const about = read("sobre-qr-estatico.html");

  assert.match(index, /href="\/sobre-qr-estatico"/);
  assert.match(
    about,
    /rel="canonical" href="https:\/\/qrcoderapido\.netlify\.app\/sobre-qr-estatico"/
  );
  assert.match(about, /href="\/"/);
  assert.match(about, /QR Code estático/);
  assert.match(about, /QR Code dinâmico/);
});

test("inclui política pública de privacidade e segurança", () => {
  const index = read("index.html");
  const privacy = read("privacidade.html");

  assert.match(index, /href="\/privacidade"/);
  assert.match(
    privacy,
    /rel="canonical" href="https:\/\/qrcoderapido\.netlify\.app\/privacidade"/
  );
  assert.match(privacy, /não utiliza analytics/);
  assert.ok(fs.existsSync(path.join(root, "SECURITY.md")));
  assert.ok(
    fs.existsSync(path.join(root, ".well-known", "security.txt"))
  );
});

test("carrega a cópia progressiva sem código remoto", () => {
  const html = read("index.html");

  assert.match(html, /src="clipboard-utils\.js"/);
  assert.match(html, /id="copy-image-button"/);
  assert.match(html, /aria-label="Copiar QR Code como imagem PNG"/);
});

test("publica cabeçalhos de segurança restritivos via netlify.toml", () => {
  const netlify = read("netlify.toml");

  assert.match(netlify, /Content-Security-Policy = "[^"]*default-src 'self'/);
  assert.match(netlify, /X-Content-Type-Options = "nosniff"/);
  assert.match(netlify, /Referrer-Policy = "no-referrer"/);
});

test("configura pipeline com testes e publicação isolada em dist", () => {
  const netlify = read("netlify.toml");
  const workflow = read(".github/workflows/ci.yml");
  const buildScript = read("scripts/prepare-deploy.js");

  assert.match(netlify, /command = "npm test && npm run build"/);
  assert.match(netlify, /publish = "dist"/);
  assert.match(workflow, /run: npm test/);
  assert.match(workflow, /run: npm run build/);
  assert.match(buildScript, /const publishEntries = \[/);
  assert.doesNotMatch(buildScript, /node_modules/);
  assert.doesNotMatch(buildScript, /\.github/);
});
