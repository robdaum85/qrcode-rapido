(function exposeClipboardUtilities(globalScope) {
  function isImageClipboardSupported(environment = globalScope) {
    return Boolean(
      environment &&
      environment.isSecureContext &&
      environment.navigator?.clipboard?.write &&
      environment.ClipboardItem
    );
  }

  function setCopyButtonAvailability(button, environment = globalScope) {
    const isSupported = isImageClipboardSupported(environment);
    button.hidden = !isSupported;
    button.disabled = !isSupported;
    return isSupported;
  }

  async function copyPngBlob(blob, environment = globalScope) {
    if (!isImageClipboardSupported(environment)) {
      throw new Error("IMAGE_CLIPBOARD_UNSUPPORTED");
    }

    const clipboardItem = new environment.ClipboardItem({
      "image/png": blob
    });

    await environment.navigator.clipboard.write([clipboardItem]);
  }

  async function handleCopyRequest(
    { createBlob, setFeedback },
    environment = globalScope
  ) {
    if (!isImageClipboardSupported(environment)) {
      setFeedback(
        "Seu navegador não permite copiar imagens. Use o download em PNG.",
        "error"
      );
      return false;
    }

    try {
      const blob = await createBlob();
      await copyPngBlob(blob, environment);
      setFeedback("QR copiado como imagem.", "success");
      return true;
    } catch {
      setFeedback(
        "Não foi possível copiar a imagem. Autorize o acesso ou baixe o PNG.",
        "error"
      );
      return false;
    }
  }

  const utilities = {
    copyPngBlob,
    handleCopyRequest,
    isImageClipboardSupported,
    setCopyButtonAvailability
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = utilities;
  } else {
    globalScope.ClipboardUtilities = utilities;
  }
})(typeof window !== "undefined" ? window : globalThis);
