# Como contribuir

Obrigado pelo interesse em contribuir com o QR Code Rápido. O objetivo deste
guia é manter as contribuições simples, verificáveis e coerentes com a proposta
do projeto.

## Princípios do projeto

O QR Code Rápido é intencionalmente:

- estático;
- executado no navegador;
- sem backend;
- sem cadastro;
- sem cookies;
- sem analytics;
- sem armazenamento do endereço;
- sem dependências externas em runtime além do próprio site.

Pull requests que adicionem backend, autenticação, analytics, cookies,
rastreamento, armazenamento remoto ou dependências pesadas serão recusados por
princípio de escopo, não por falta de mérito técnico.

Mudanças que alterem esses princípios precisam nascer como discussão separada,
com justificativa explícita e revisão das políticas públicas do site.

## Pré-requisitos

- navegador moderno;
- Node.js 18 ou superior para executar os testes;
- Python é opcional e usado apenas como servidor local simples.

Não é necessário executar `npm install`. A suíte utiliza somente módulos
nativos do Node.js.

## Rodar localmente

É possível abrir `index.html` diretamente no navegador. Para reproduzir melhor
o comportamento do deploy:

```bash
python -m http.server 8000
```

Acesse:

```text
http://localhost:8000/
```

## Executar os testes

```bash
npm test
```

Toda contribuição deve manter a suíte aprovada.

## Atualizar a biblioteca incorporada

A biblioteca `qrcode` é distribuída dentro de `vendor/`. Uma atualização
legítima precisa alterar, no mesmo pull request:

1. `vendor/qrcode.min.js`;
2. `vendor/qrcode.LICENSE`, caso a licença tenha mudado;
3. `vendor/qrcode.sha256`;
4. a versão registrada em `THIRD_PARTY_NOTICES.md`;
5. a versão e o hash registrados em `DOCUMENTACAO_PROJETO.md`;
6. testes ou código afetados pela nova versão.

Depois de substituir o arquivo, regenere o SHA-256.

PowerShell:

```powershell
(Get-FileHash -Algorithm SHA256 vendor/qrcode.min.js).Hash.ToLower()
```

Linux ou macOS:

```bash
sha256sum vendor/qrcode.min.js
```

Grave somente o hash em minúsculas e uma quebra de linha em
`vendor/qrcode.sha256`. Em seguida:

```bash
npm test
```

O teste de integridade deve falhar se um único byte do arquivo mudar sem a
atualização correspondente do hash.

## Padrão sugerido de commits

Use mensagens curtas e objetivas:

```text
feat: adiciona nova capacidade
fix: corrige um comportamento
docs: atualiza documentação
test: adiciona ou ajusta testes
style: altera somente apresentação
refactor: reorganiza sem mudar comportamento
chore: manutenção de dependências ou ferramentas
```

## Antes de abrir um pull request

- execute `npm test`;
- teste a geração no navegador;
- teste PNG, SVG e cópia quando aplicável;
- confira teclado e leitor de tela quando a interface mudar;
- evite scripts e estilos inline para manter compatibilidade com a CSP;
- atualize a documentação quando o comportamento mudar;
- revise a política de privacidade no mesmo PR se houver qualquer mudança de
  armazenamento, rede ou tratamento de dados.

## Issues de segurança

Não publique vulnerabilidades em issues abertas. Siga as instruções de
`SECURITY.md` para um reporte responsável.
