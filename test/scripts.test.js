const test = require("node:test");
const assert = require("node:assert/strict");
const {
  handleCopyRequest,
  setCopyButtonAvailability
} = require("../clipboard-utils.js");

class ClipboardItemMock {
  constructor(data) {
    this.data = data;
  }
}

function createSupportedEnvironment(write) {
  return {
    isSecureContext: true,
    ClipboardItem: ClipboardItemMock,
    navigator: {
      clipboard: { write }
    }
  };
}

test("copia um Blob PNG com ClipboardItem em ambiente suportado", async () => {
  const writes = [];
  const feedback = [];
  const blob = { type: "image/png" };
  const environment = createSupportedEnvironment(async (items) => {
    writes.push(items);
  });

  const copied = await handleCopyRequest(
    {
      createBlob: async () => blob,
      setFeedback: (message, type) => feedback.push({ message, type })
    },
    environment
  );

  assert.equal(copied, true);
  assert.equal(writes.length, 1);
  assert.equal(writes[0].length, 1);
  assert.equal(writes[0][0].data["image/png"], blob);
  assert.deepEqual(feedback.at(-1), {
    message: "QR copiado como imagem.",
    type: "success"
  });
});

test("oculta e desabilita o botão sem suporte à Clipboard API", () => {
  const button = { hidden: false, disabled: false };
  const supported = setCopyButtonAvailability(
    button,
    { isSecureContext: true, navigator: {} }
  );

  assert.equal(supported, false);
  assert.equal(button.hidden, true);
  assert.equal(button.disabled, true);
});

test("mostra o botão quando a cópia de imagem é suportada", () => {
  const button = { hidden: true, disabled: true };
  const environment = createSupportedEnvironment(async () => {});
  const supported = setCopyButtonAvailability(button, environment);

  assert.equal(supported, true);
  assert.equal(button.hidden, false);
  assert.equal(button.disabled, false);
});

test("trata recusa de permissão e sugere o download sem travar", async () => {
  const feedback = [];
  const environment = createSupportedEnvironment(async () => {
    throw new Error("Permissão negada");
  });

  const copied = await handleCopyRequest(
    {
      createBlob: async () => ({ type: "image/png" }),
      setFeedback: (message, type) => feedback.push({ message, type })
    },
    environment
  );

  assert.equal(copied, false);
  assert.equal(feedback.at(-1).type, "error");
  assert.match(feedback.at(-1).message, /baixe o PNG/i);
});
