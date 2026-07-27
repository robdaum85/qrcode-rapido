(function exposeUrlUtilities(globalScope) {
  function normalizeUrl(rawValue) {
    const value = rawValue.trim();

    if (!value) {
      throw new Error("Cole um endereço para gerar o QR Code.");
    }

    const isLocalhostWithoutProtocol = /^localhost(?::\d+)?(?:\/|$)/i.test(value);
    const hasProtocol =
      /^[a-z][a-z\d+\-.]*:/i.test(value) && !isLocalhostWithoutProtocol;
    const looksLikeAddress =
      value.includes(".") ||
      isLocalhostWithoutProtocol ||
      /^(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:\/|$)/.test(value);

    if (!hasProtocol && !looksLikeAddress) {
      throw new Error("Informe um endereço completo, como exemplo.com/pagina.");
    }

    const candidate = hasProtocol ? value : `https://${value}`;
    let parsedUrl;

    try {
      parsedUrl = new URL(candidate);
    } catch {
      throw new Error("Esse endereço não parece válido. Confira e tente novamente.");
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Use um endereço que comece com http:// ou https://.");
    }

    if (
      !parsedUrl.hostname ||
      parsedUrl.hostname === "." ||
      parsedUrl.hostname.startsWith(".") ||
      parsedUrl.hostname.includes("..")
    ) {
      throw new Error("O endereço precisa ter um domínio válido.");
    }

    const hostname = parsedUrl.hostname;
    const isLocalhost = hostname.toLowerCase() === "localhost";
    const isLiteralIpv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
    const isLiteralIpv6 = hostname.startsWith("[") || hostname.includes(":");
    const hasPlausibleTld = /\.[a-z]{2,}$/i.test(hostname);

    if (!isLocalhost && !isLiteralIpv4 && !isLiteralIpv6 && !hasPlausibleTld) {
      throw new Error(
        "Esse endereço não parece um domínio válido. Ex.: exemplo.com."
      );
    }

    return parsedUrl.href;
  }

  const utilities = { normalizeUrl };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = utilities;
  } else {
    globalScope.QRCodeRapido = utilities;
  }
})(typeof window !== "undefined" ? window : globalThis);
