(function (globalScope) {
  const qrColors = {
    dark: "#10233f",
    light: "#ffffff"
  };
  const qrBaseOptions = {
    margin: 4,
    errorCorrectionLevel: "Q",
    color: qrColors
  };

  function createApp(doc, win, deps) {
    const form = doc.getElementById("qr-form");
    const urlInput = doc.getElementById("url");
    const generateButton = doc.getElementById("generate-button");
    const feedback = doc.getElementById("feedback");
    const result = doc.getElementById("qr-result");
    const qrCanvas = doc.getElementById("qrcode");
    const destinationLink = doc.getElementById("destination-link");
    const downloadPngButton = doc.getElementById("download-png-button");
    const downloadSvgButton = doc.getElementById("download-svg-button");
    const copyImageButton = doc.getElementById("copy-image-button");

    const buttonDefaultText = generateButton.textContent;
    const revokeDelayMs = deps.revokeDelayMs ?? 1000;

    let currentUrl = "";

    if (deps.ClipboardUtilities) {
      deps.ClipboardUtilities.setCopyButtonAvailability(copyImageButton, win);
    }

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

    function handleSubmit(event) {
      event.preventDefault();
      resetResult();

      let normalizedUrl;

      try {
        normalizedUrl = deps.normalizeUrl(urlInput.value);
      } catch (error) {
        setFeedback(error.message, "error");
        urlInput.focus();
        return;
      }

      if (typeof deps.QRCode === "undefined") {
        setFeedback(
          "Não foi possível carregar o gerador. Verifique sua conexão e tente novamente.",
          "error"
        );
        return;
      }

      setLoading(true);

      try {
        deps.QRCode.toCanvas(
          qrCanvas,
          normalizedUrl,
          {
            ...qrBaseOptions,
            width: 280
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
    }

    function handleInput() {
      if (!result.hidden) {
        resetResult();
      } else if (feedback.textContent) {
        setFeedback();
      }
    }

    function triggerDownload(blob, filename) {
      const downloadUrl = win.URL.createObjectURL(blob);
      const link = doc.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      doc.body.appendChild(link);
      link.click();
      link.remove();
      win.setTimeout(() => win.URL.revokeObjectURL(downloadUrl), revokeDelayMs);
    }

    function renderQrCanvas(width) {
      return new Promise((resolve, reject) => {
        const exportCanvas = doc.createElement("canvas");

        deps.QRCode.toCanvas(
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

    async function handleDownloadPng() {
      if (!currentUrl) {
        return;
      }

      try {
        const blob = await createPngBlob(2048);
        triggerDownload(blob, "qr-code-estatico-2048px.png");
        setFeedback("Download do PNG iniciado.", "success");
      } catch (error) {
        console.error(error);
        setFeedback("Não foi possível preparar o PNG.", "error");
      }
    }

    function handleDownloadSvg() {
      if (!currentUrl) {
        return;
      }

      deps.QRCode.toString(
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

          const blob = new win.Blob([svg], { type: "image/svg+xml;charset=utf-8" });
          triggerDownload(blob, "qr-code-estatico.svg");
          setFeedback("Download do SVG iniciado.", "success");
        }
      );
    }

    async function handleCopyImage() {
      if (!currentUrl || !deps.ClipboardUtilities) {
        return;
      }

      await deps.ClipboardUtilities.handleCopyRequest(
        {
          createBlob: () => createPngBlob(512),
          setFeedback
        },
        win
      );
    }

    form.addEventListener("submit", handleSubmit);
    urlInput.addEventListener("input", handleInput);
    downloadPngButton.addEventListener("click", handleDownloadPng);
    downloadSvgButton.addEventListener("click", handleDownloadSvg);
    copyImageButton.addEventListener("click", handleCopyImage);

    return {
      handleSubmit,
      handleInput,
      handleDownloadPng,
      handleDownloadSvg,
      handleCopyImage,
      createPngBlob,
      resetResult,
      setLoading,
      setFeedback
    };
  }

  function autoInit() {
    createApp(document, window, {
      normalizeUrl: (value) => window.QRCodeRapido.normalizeUrl(value),
      QRCode: window.QRCode,
      ClipboardUtilities: window.ClipboardUtilities
    });
  }

  const api = { createApp, qrBaseOptions };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    autoInit();
  }
})(typeof window !== "undefined" ? window : globalThis);
