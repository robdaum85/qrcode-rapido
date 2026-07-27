# QR Code Rápido

Gerador de QR Code estático, sem cadastro, analytics ou redirecionamento
intermediário. O endereço é validado e codificado no próprio navegador.

- Site: https://qrcoderapido.netlify.app/
- Artigo: [O QR code que um cliente já tinha divulgado parou de funcionar depois de 7 dias](https://medium.com/@robdaum85/o-qr-code-que-um-cliente-j%C3%A1-tinha-divulgado-parou-de-funcionar-depois-de-7-dias-6b87e3b7e3c4)
- Documentação: [DOCUMENTACAO_PROJETO.md](DOCUMENTACAO_PROJETO.md)

## Princípios

- estático e executado no navegador;
- sem backend ou cadastro;
- sem cookies ou analytics;
- sem armazenamento do endereço;
- sem dependências externas em runtime;
- saída em PNG, SVG ou área de transferência.

## Rodar localmente

```bash
python -m http.server 8000
```

Abra `http://localhost:8000/`.

## Testes

```bash
npm test
```

A suíte valida URLs, geração, Clipboard API, páginas públicas, governança e a
integridade SHA-256 da biblioteca incorporada.

## Build de publicação

```bash
npm run build
```

O comando recria `dist/` com uma lista explícita de arquivos públicos. Testes,
documentos internos, templates do GitHub e `node_modules` não entram no deploy.

O Netlify executa:

```text
npm test && npm run build
```

e publica somente `dist/`.

## Contribuir e reportar segurança

- [Como contribuir](CONTRIBUTING.md)
- [Política de segurança](SECURITY.md)
- [Política de privacidade](privacidade.html)

## Licença

MIT. Consulte [LICENSE](LICENSE) e
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
