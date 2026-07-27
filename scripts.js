const form = document.getElementById("qr-form");
const urlInput = document.getElementById("url");
const generateButton = document.getElementById("generate-button");
const feedback = document.getElementById("feedback");
const result = document.getElementById("qr-result");
const qrCanvas = document.getElementById("qrcode");
const destinationLink = document.getElementById("destination-link");
const downloadPngButton = document.getElementById("download-png-button");
const downloadSvgButton = document.getElementById("download-svg-button");
const copyImageButton = document.getElementById("copy-image-button");

const buttonDefaultText = generateButton.textContent;
const qrColors = {
  dark: "#10233f",
  light: "#ffffff"
};
const qrBaseOptions = {
  margin: 4,
  errorCorrectionLevel: "M",
  color: qrColors
};

let currentUrl = "";

window.ClipboardUtilities.setCopyButtonAvailability(copyImageButton, window);

function setFeedback(message = "", type = "") {
  feedback.textContent = message;
  feedback.className = type ? `feedback feedback--${type}` : "feedback";
}

function resetResult() {
  result.hidden = true;
  currentUrl = "";
  destinationLink.removeAttribute("href");
  destinationLink.textContent = "";
  setFeedback();
}

function setLoading(isLoading) {
  generateButton.disabled = isLoading;
  generateButton.textContent = isLoading ? "Gerando..." : buttonDefaultText;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  resetResult();

  let normalizedUrl;

  try {
    normalizedUrl = window.QRCodeRapido.normalizeUrl(urlInput.value);
  } catch (error) {
    setFeedback(error.message, "error");
    urlInput.focus();
    return;
  }

  if (typeof window.QRCode === "undefined") {
    setFeedback(
      "Não foi possível carregar o gerador. Verifique sua conexão e tente novamente.",
      "error"
    );
    return;
  }

  setLoading(true);

  try {
    window.QRCode.toCanvas(
      qrCanvas,
      normalizedUrl,
      {
        ...qrBaseOptions,
        width: 280,
      },
      (error) => {
        setLoading(false);

        if (error) {
          console.error(error);
          setFeedback("Não conseguimos gerar o código. Tente novamente.", "error");
          return;
        }

        urlInput.value = normalizedUrl;
        currentUrl = normalizedUrl;
        destinationLink.href = normalizedUrl;
        destinationLink.textContent = normalizedUrl;
        result.hidden = false;
        setFeedback("QR Code gerado com sucesso.", "success");
        result.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    );
  } catch (error) {
    console.error(error);
    setLoading(false);
    setFeedback("Não conseguimos gerar o código. Tente novamente.", "error");
  }
});

urlInput.addEventListener("input", () => {
  if (!result.hidden) {
    resetResult();
  } else if (feedback.textContent) {
    setFeedback();
  }
});

function triggerDownload(blob, filename) {
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}

function renderQrCanvas(width) {
  return new Promise((resolve, reject) => {
    const exportCanvas = document.createElement("canvas");

    window.QRCode.toCanvas(
      exportCanvas,
      currentUrl,
      {
        ...qrBaseOptions,
        width
      },
      (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(exportCanvas);
      }
    );
  });
}

function canvasToPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Não foi possível converter o canvas em PNG."));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
}

async function createPngBlob(width) {
  const exportCanvas = await renderQrCanvas(width);
  return canvasToPngBlob(exportCanvas);
}

downloadPngButton.addEventListener("click", async () => {
  if (!currentUrl) {
    return;
  }

  try {
    const blob = await createPngBlob(1024);
    triggerDownload(blob, "qr-code-estatico-1024px.png");
    setFeedback("Download do PNG iniciado.", "success");
  } catch (error) {
    console.error(error);
    setFeedback("Não foi possível preparar o PNG.", "error");
  }
});

downloadSvgButton.addEventListener("click", () => {
  if (!currentUrl) {
    return;
  }

  window.QRCode.toString(
    currentUrl,
    {
      ...qrBaseOptions,
      type: "svg"
    },
    (error, svg) => {
      if (error) {
        console.error(error);
        setFeedback("Não foi possível preparar o SVG.", "error");
        return;
      }

      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      triggerDownload(blob, "qr-code-estatico.svg");
      setFeedback("Download do SVG iniciado.", "success");
    }
  );
});

copyImageButton.addEventListener("click", async () => {
  if (!currentUrl) {
    return;
  }

  await window.ClipboardUtilities.handleCopyRequest(
    {
      createBlob: () => createPngBlob(512),
      setFeedback
    },
    window
  );
});
