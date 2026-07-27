const test = require("node:test");
const { mock } = require("node:test");
const assert = require("node:assert/strict");
const { Window } = require("happy-dom");
const { createApp } = require("../scripts.js");
const { normalizeUrl } = require("../url-utils.js");

const FIXTURE_HTML = `
  <form id="qr-form" novalidate>
    <input id="url" name="url" type="url" aria-describedby="url-help feedback">
    <button id="generate-button" type="submit">Gerar QR Code</button>
    <p id="feedback" role="status" aria-live="polite"></p>
  </form>
  <section id="qr-result" hidden>
    <canvas id="qrcode" width="280" height="280"></canvas>
    <a id="destination-link" href="#"></a>
    <button id="download-png-button" type="button">Baixar PNG</button>
    <button id="download-svg-button" type="button">Baixar SVG</button>
    <button id="copy-image-button" type="button" hidden>Copiar imagem</button>
  </section>
`;

function createFixture(extraDeps = {}) {
  const window = new Window();
  const document = window.document;
  document.body.innerHTML = FIXTURE_HTML;

  const elements = {
    form: document.getElementById("qr-form"),
    urlInput: document.getElementById("url"),
    generateButton: document.getElementById("generate-button"),
    feedback: document.getElementById("feedback"),
    result: document.getElementById("qr-result"),
    qrCanvas: document.getElementById("qrcode"),
    destinationLink: document.getElementById("destination-link")
  };

  const deps = {
    normalizeUrl,
    revokeDelayMs: 0,
    ...extraDeps
  };

  const app = createApp(document, window, deps);

  return { window, document, elements, app, deps };
}

function fakeSubmitEvent() {
  let defaultPrevented = false;
  return {
    preventDefault() {
      defaultPrevented = true;
    },
    get defaultPrevented() {
      return defaultPrevented;
    }
  };
}

function mockQrCodeSuccess() {
  return {
    toCanvas: mock.fn((canvas, _text, _options, callback) => {
      canvas.dataset.rendered = "true";
      callback(null);
    }),
    toString: mock.fn((_text, _options, callback) => {
      callback(null, '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    })
  };
}

test("submit com URL válida leva ao estado de sucesso e desenha o canvas", () => {
  const { elements, app } = createFixture({ QRCode: mockQrCodeSuccess() });

  elements.urlInput.value = "exemplo.com/pagina";
  app.handleSubmit(fakeSubmitEvent());

  assert.equal(elements.result.hidden, false);
  assert.equal(elements.qrCanvas.dataset.rendered, "true");
  assert.equal(elements.destinationLink.href, "https://exemplo.com/pagina");
  assert.equal(elements.feedback.textContent, "QR Code gerado com sucesso.");
  assert.equal(elements.feedback.className, "feedback feedback--success");
  assert.equal(elements.generateButton.disabled, false);
  assert.equal(elements.generateButton.textContent, "Gerar QR Code");
});

test("submit com URL inválida mostra erro, mantém resultado oculto e não trava o botão", () => {
  const { elements, app } = createFixture({ QRCode: mockQrCodeSuccess() });

  elements.urlInput.value = "apenas um texto";
  app.handleSubmit(fakeSubmitEvent());

  assert.equal(elements.result.hidden, true);
  assert.match(elements.feedback.textContent, /Informe um endereço completo/);
  assert.equal(elements.feedback.className, "feedback feedback--error");
  assert.equal(elements.generateButton.disabled, false);
  assert.equal(elements.generateButton.textContent, "Gerar QR Code");
});

test("mensagem de erro fica associada ao campo por aria-describedby", () => {
  const { elements } = createFixture({ QRCode: mockQrCodeSuccess() });

  const describedBy = elements.urlInput.getAttribute("aria-describedby");

  assert.ok(describedBy.split(" ").includes(elements.feedback.id));
});

test("biblioteca de QR ausente mostra aviso de indisponibilidade sem travar a interface", () => {
  const { elements, app } = createFixture({ QRCode: undefined });

  elements.urlInput.value = "exemplo.com";
  app.handleSubmit(fakeSubmitEvent());

  assert.match(elements.feedback.textContent, /Não foi possível carregar o gerador/);
  assert.equal(elements.result.hidden, true);
  assert.equal(elements.generateButton.disabled, false);
});

test("erro síncrono da biblioteca é tratado e o botão volta ao normal", () => {
  const QRCode = {
    toCanvas: mock.fn(() => {
      throw new Error("falha simulada");
    })
  };
  const { elements, app } = createFixture({ QRCode });

  elements.urlInput.value = "exemplo.com";
  app.handleSubmit(fakeSubmitEvent());

  assert.match(elements.feedback.textContent, /Não conseguimos gerar o código/);
  assert.equal(elements.generateButton.disabled, false);
  assert.equal(elements.generateButton.textContent, "Gerar QR Code");
});

test("o Enter no formulário aciona o mesmo fluxo do clique no botão", () => {
  const { window, document, elements } = createFixture({
    QRCode: mockQrCodeSuccess()
  });

  elements.urlInput.value = "exemplo.com/enter";

  const submitEvent = new window.Event("submit", {
    bubbles: true,
    cancelable: true
  });
  elements.form.dispatchEvent(submitEvent);

  assert.equal(elements.result.hidden, false);
  assert.equal(elements.destinationLink.href, "https://exemplo.com/enter");
  assert.equal(submitEvent.defaultPrevented, true);
});

test("gerar um novo QR Code substitui o resultado anterior", () => {
  const { elements, app } = createFixture({ QRCode: mockQrCodeSuccess() });

  elements.urlInput.value = "exemplo.com/primeiro";
  app.handleSubmit(fakeSubmitEvent());
  assert.equal(elements.destinationLink.href, "https://exemplo.com/primeiro");

  elements.urlInput.value = "exemplo.com/segundo";
  app.handleSubmit(fakeSubmitEvent());

  assert.equal(elements.destinationLink.href, "https://exemplo.com/segundo");
});

test("digitar após um resultado gerado limpa o resultado e a mensagem", () => {
  const { elements, app } = createFixture({ QRCode: mockQrCodeSuccess() });

  elements.urlInput.value = "exemplo.com";
  app.handleSubmit(fakeSubmitEvent());
  assert.equal(elements.result.hidden, false);

  app.handleInput();

  assert.equal(elements.result.hidden, true);
  assert.equal(elements.feedback.textContent, "");
});

test("baixar o PNG cria e revoga o objectURL", async () => {
  const createObjectURL = mock.fn(() => "blob:png");
  const revokeObjectURL = mock.fn();
  const { window, elements, app } = createFixture({ QRCode: mockQrCodeSuccess() });

  window.URL.createObjectURL = createObjectURL;
  window.URL.revokeObjectURL = revokeObjectURL;

  elements.urlInput.value = "exemplo.com";
  app.handleSubmit(fakeSubmitEvent());

  await app.handleDownloadPng();
  await new Promise((resolve) => window.setTimeout(resolve, 0));

  assert.equal(createObjectURL.mock.calls.length, 1);
  assert.equal(revokeObjectURL.mock.calls.length, 1);
  assert.equal(revokeObjectURL.mock.calls[0].arguments[0], "blob:png");
  assert.match(elements.feedback.textContent, /Download do PNG iniciado/);
});

test("baixar o SVG cria e revoga o objectURL", async () => {
  const createObjectURL = mock.fn(() => "blob:svg");
  const revokeObjectURL = mock.fn();
  const { window, elements, app } = createFixture({ QRCode: mockQrCodeSuccess() });

  window.URL.createObjectURL = createObjectURL;
  window.URL.revokeObjectURL = revokeObjectURL;

  elements.urlInput.value = "exemplo.com";
  app.handleSubmit(fakeSubmitEvent());

  app.handleDownloadSvg();
  await new Promise((resolve) => window.setTimeout(resolve, 0));

  assert.equal(createObjectURL.mock.calls.length, 1);
  assert.equal(revokeObjectURL.mock.calls.length, 1);
  assert.equal(revokeObjectURL.mock.calls[0].arguments[0], "blob:svg");
  assert.match(elements.feedback.textContent, /Download do SVG iniciado/);
});

test("PNG exportado usa 2048px de largura e nome de arquivo correspondente", async () => {
  const toCanvas = mock.fn((canvas, _text, _options, callback) => callback(null));
  const { window, elements, app } = createFixture({
    QRCode: { toCanvas }
  });

  window.URL.createObjectURL = mock.fn(() => "blob:png");
  window.URL.revokeObjectURL = mock.fn();

  elements.urlInput.value = "exemplo.com";
  app.handleSubmit(fakeSubmitEvent());

  await app.handleDownloadPng();

  const exportCall = toCanvas.mock.calls[1];
  assert.equal(exportCall.arguments[2].width, 2048);
});
