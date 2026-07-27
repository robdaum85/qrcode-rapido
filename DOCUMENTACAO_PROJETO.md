# QR Code Rápido — documentação do projeto

## Visão geral

O QR Code Rápido é uma aplicação web estática para gerar QR Codes que gravam o
endereço final diretamente no código.

O projeto nasceu depois que um cliente utilizou um gerador que criou um QR Code
dinâmico e desativou o redirecionamento após sete dias. A solução foi construir
uma página simples, transparente e sem cadastro, banco de dados ou serviço
intermediário.

- Site: https://qrcoderapido.netlify.app/
- Artigo: https://medium.com/@robdaum85/o-qr-code-que-um-cliente-j%C3%A1-tinha-divulgado-parou-de-funcionar-depois-de-7-dias-6b87e3b7e3c4
- Tipo de projeto: aplicação web estática
- Licença: MIT
- Idioma da interface: português do Brasil
- Hospedagem atual: Netlify

## Objetivo

Permitir que qualquer pessoa:

1. informe um endereço HTTP ou HTTPS;
2. confira o destino que será codificado;
3. gere um QR Code estático no próprio navegador;
4. baixe o resultado em PNG ou SVG;
5. utilize o arquivo sem depender da continuidade deste site.

O QR Code não possui prazo de validade imposto pelo gerador. O endereço
codificado, entretanto, precisa continuar ativo. Se o domínio expirar ou a
página for removida, o QR Code continuará contendo o mesmo endereço, mas o
destino estará indisponível.

## Estado atual

Em 26 de julho de 2026, a base local está preparada contendo:

- interface e alinhamentos novos;
- biblioteca `qrcode` hospedada localmente;
- validação e normalização de endereços;
- download em PNG de alta resolução;
- download em SVG;
- metadados Open Graph;
- imagem social e favicon;
- informações de licença;
- página educativa sobre QR estático e dinâmico;
- política pública de privacidade;
- política e canal de reporte de segurança;
- botão progressivo para copiar o QR Code como imagem;
- verificação automática da integridade da biblioteca;
- guia e templates para contribuições.

A suíte automatizada foi executada com o seguinte resultado:

```text
24 testes executados
24 testes aprovados
0 falhas
```

## Evolução realizada

### Versão inicial

A primeira versão continha apenas:

- um campo de texto;
- um botão com evento `onclick`;
- um `canvas`;
- carregamento da biblioteca por CDN;
- validação apenas de campo vazio;
- mensagem simples de sucesso ou erro.

Ela comprovava o conceito, mas ainda funcionava como protótipo.

### Evolução para o MVP

O projeto foi reorganizado para entregar um fluxo mais seguro e utilizável:

- formulário semântico;
- suporte à tecla Enter;
- validação e normalização da URL;
- rejeição de protocolos não permitidos;
- preview do destino codificado;
- tratamento de indisponibilidade da biblioteca;
- estados separados de carregamento, sucesso e erro;
- resultado oculto até a geração;
- download em formatos adequados para tela e impressão;
- identidade visual responsiva;
- acessibilidade para teclado e leitores de tela;
- testes permanentes;
- licenças e dependências documentadas.

## Arquitetura

Não existe backend, API própria, banco de dados ou processo de autenticação.

```text
Usuário informa o endereço
        ↓
url-utils.js normaliza e valida
        ↓
scripts.js solicita a codificação
        ↓
vendor/qrcode.min.js gera o QR Code
        ↓
Canvas exibe o preview
        ↓
Usuário baixa PNG ou SVG
```

Todo o processamento acontece no navegador.

## Estrutura de arquivos

```text
qrcoderapido/
├── .gitignore
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── workflows/
│   │   └── ci.yml
│   └── PULL_REQUEST_TEMPLATE.md
├── .well-known/
│   └── security.txt
├── assets/
│   ├── favicon.svg
│   ├── og-image.png
│   └── og-image.svg
├── test/
│   ├── project.test.js
│   ├── scripts.test.js
│   ├── vendor.test.js
│   └── url-utils.test.js
├── vendor/
│   ├── qrcode.LICENSE
│   ├── qrcode.min.js
│   └── qrcode.sha256
├── clipboard-utils.js
├── CONTRIBUTING.md
├── DOCUMENTACAO_PROJETO.md
├── index.html
├── LICENSE
├── package.json
├── privacidade.html
├── README.md
├── SECURITY.md
├── scripts/
│   └── prepare-deploy.js
├── scripts.js
├── sobre-qr-estatico.html
├── styles.css
├── THIRD_PARTY_NOTICES.md
├── netlify.toml
├── _redirects
└── url-utils.js
```

### `index.html`

Responsável pela estrutura semântica da aplicação:

- cabeçalho e proposta de valor;
- formulário de entrada;
- mensagens de ajuda e feedback;
- lista de características;
- preview do QR Code;
- apresentação do destino;
- botões de download;
- metadados sociais;
- favicon;
- informações de marca registrada.
- navegação para conteúdo educativo e política de privacidade.

Os scripts são carregados com `defer` nesta ordem:

1. `vendor/qrcode.min.js`;
2. `url-utils.js`;
3. `clipboard-utils.js`;
4. `scripts.js`.

Essa ordem garante que a biblioteca e a validação estejam disponíveis antes da
inicialização da interface.

### `url-utils.js`

Contém a função testável `normalizeUrl()`.

Comportamentos implementados:

- remove espaços das extremidades;
- adiciona `https://` quando necessário;
- aceita HTTP e HTTPS;
- aceita `localhost` durante o desenvolvimento;
- rejeita campo vazio;
- rejeita texto que não se parece com endereço;
- rejeita protocolos como FTP;
- rejeita hostnames estruturalmente inválidos.

O módulo funciona tanto no navegador quanto nos testes executados pelo Node.js.

### `scripts.js`

Controla o comportamento da interface:

- submissão do formulário;
- validação do endereço;
- geração do preview;
- estados do botão;
- mensagens de sucesso e erro;
- exibição e limpeza do resultado;
- criação dos downloads;
- liberação dos objetos temporários de download.

### `clipboard-utils.js`

Isola a detecção e o uso da Clipboard API:

- verifica contexto seguro;
- verifica `navigator.clipboard.write`;
- verifica `ClipboardItem`;
- oculta e desabilita o botão quando não há suporte;
- copia um Blob PNG quando permitido;
- transforma erros de permissão em feedback acessível;
- sugere o download em PNG como fallback.

A imagem copiada possui 512 pixels, resolução suficiente para colagem em
documentos e conversas sem o custo da exportação de 1024 pixels.

### Páginas públicas

`sobre-qr-estatico.html` explica:

- onde o destino fica armazenado;
- diferenças entre QR estático e dinâmico;
- vantagens e dependências de cada formato;
- por que o projeto escolheu QR estático.

`privacidade.html` torna pública a política real da aplicação:

- sem cadastro, cookies ou analytics;
- sem armazenamento ou consulta do destino;
- processamento no navegador;
- uso explícito da área de transferência;
- distinção entre a aplicação e registros técnicos do Netlify.

As duas páginas reutilizam `styles.css`, possuem metadados próprios e navegação
bidirecional com o gerador.

### `styles.css`

Define:

- cores e variáveis visuais;
- tipografia;
- grid e alinhamento dos blocos;
- cards do gerador e do resultado;
- estados de foco, hover e carregamento;
- mensagens de erro e sucesso;
- layout dos downloads;
- adaptação para telas pequenas;
- suporte a `prefers-reduced-motion`.

### `vendor/`

Contém uma cópia local da biblioteca `qrcode` 1.5.1.

A biblioteca não é mais carregada pelo jsDelivr durante a visita. Isso remove
uma dependência operacional externa do fluxo de geração.

- Projeto original: https://github.com/soldair/node-qrcode
- Versão: 1.5.1
- Licença: MIT
- SHA-256 do arquivo incorporado:
  `ec64d89ab3096dce8084912dedff9f2ca5ae64144d0cacd4a082c293d5d06b59`

O valor canônico fica em `vendor/qrcode.sha256`. `test/vendor.test.js` lê o
vendor como binário, recalcula o hash e falha se qualquer byte divergir.

Uma atualização legítima precisa substituir a biblioteca, revisar a licença,
regenerar o hash e commitar todas as alterações juntas. O processo completo
está em `CONTRIBUTING.md`.

## Validação do endereço

A aplicação utiliza a API nativa `URL` do navegador.

Exemplos:

| Entrada | Resultado |
|---|---|
| `exemplo.com/pagina` | `https://exemplo.com/pagina` |
| `https://exemplo.com` | mantida como HTTPS |
| `http://localhost:3000` | aceita |
| campo vazio | rejeitado |
| `apenas um texto` | rejeitado |
| `ftp://exemplo.com` | rejeitado |
| `https://.` | rejeitado |

A validação determina se o endereço é estruturalmente aceitável. Ela não envia
requisições ao destino para verificar se a página existe, evitando vazamento de
informações e dependência de rede adicional.

## Configuração do QR Code

As opções principais são compartilhadas entre o preview e os arquivos:

```js
{
  margin: 4,
  errorCorrectionLevel: "M",
  color: {
    dark: "#10233f",
    light: "#ffffff"
  }
}
```

### Margem

A margem utiliza quatro módulos. Essa zona branca, também conhecida como zona
silenciosa, ajuda os leitores a separar o QR Code do material ao redor.

### Correção de erro

O nível `M` foi definido explicitamente para equilibrar:

- capacidade de dados;
- densidade visual;
- tolerância a pequenos danos.

Isso não significa que qualquer logotipo ou obstrução possa ser aplicado com
segurança. Alterações visuais precisam ser testadas em diferentes leitores.

### Cores

O código utiliza azul-marinho sobre fundo branco para preservar contraste e
manter a identidade visual da página.

## Formatos de saída

### Preview

- renderizado em `canvas`;
- largura de 280 pixels;
- destinado à conferência na interface.

### PNG

- resolução de 1024 × 1024 pixels;
- nome: `qr-code-estatico-1024px.png`;
- apropriado para telas, documentos e impressões comuns.

O PNG é gerado em um canvas separado. Assim, o preview pode permanecer leve
sem limitar a qualidade do arquivo baixado.

### SVG

- formato vetorial;
- nome: `qr-code-estatico.svg`;
- pode ser ampliado sem perda de qualidade;
- indicado para materiais gráficos e impressão em tamanhos maiores.

### Área de transferência

- PNG de 512 pixels;
- ativado somente com Clipboard API de imagem;
- exige HTTPS ou localhost;
- acionado apenas por clique do usuário;
- não lê a área de transferência;
- em falha ou falta de suporte, orienta o download em PNG.

## Privacidade e segurança

O projeto:

- não possui cadastro;
- não usa cookies;
- não armazena o endereço digitado;
- não envia o endereço para um backend;
- não utiliza analytics;
- não cria redirecionamentos;
- não realiza chamadas ao destino informado;
- aceita somente HTTP e HTTPS;
- utiliza `noopener noreferrer` ao abrir o destino em nova aba.
- não lê o conteúdo da área de transferência.

Depois do deploy, todos os recursos necessários à geração são servidos pelo
próprio site.

O Netlify, como provedor de hospedagem, pode processar registros técnicos de
acesso para segurança e operação. A aplicação não consulta esses registros
para criar perfis ou medir leituras.

## Governança e segurança

`CONTRIBUTING.md` documenta:

- princípios e limites de escopo;
- execução local e testes;
- padrão sugerido de commits;
- atualização legítima do vendor e do hash;
- revisão obrigatória da política quando o tratamento de dados mudar.

`.github/` contém templates de bug, sugestão e pull request. Eles orientam
contribuições sem ampliar silenciosamente o escopo estático do produto.

`SECURITY.md` define:

- versão suportada;
- canal privado de reporte;
- metas de resposta;
- compromisso com pesquisa de boa-fé;
- componentes dentro e fora do escopo.

`/.well-known/security.txt` publica contato, política, idiomas preferidos e
prazo de validade conforme o formato da RFC 9116.

As novas páginas não possuem scripts ou estilos inline. Elas estão preparadas
para uma CSP restritiva futura, mas os headers da CSP pertencem à spec M3 e não
foram adicionados por esta evolução.

## Acessibilidade

Foram implementados:

- `lang="pt-BR"`;
- `<form>` semântico;
- `<label>` associado ao campo;
- `type="url"` e `inputmode="url"`;
- suporte à tecla Enter;
- `aria-describedby`;
- região de feedback com `aria-live`;
- descrição acessível para o `canvas`;
- foco visível nos botões e campo;
- contraste entre texto, fundo e controles;
- navegação por teclado;
- respeito à preferência de movimento reduzido.

## Layout responsivo

Os blocos principais compartilham:

- largura máxima de 880 pixels;
- alinhamento central;
- padding consistente;
- espaçamento interno padronizado.

Em telas maiores:

- campo e botão ficam na mesma linha;
- benefícios ocupam três colunas;
- QR Code e ações de download ocupam duas áreas.

Em telas menores:

- campo e botão são empilhados;
- benefícios formam uma coluna;
- QR Code, destino e downloads são reorganizados verticalmente;
- botões de PNG e SVG ocupam a largura disponível.
- PNG, SVG e cópia são reorganizados em uma coluna.

## Metadados e compartilhamento

O projeto possui:

- título descritivo;
- meta description;
- URL canônica;
- `theme-color`;
- Open Graph;
- Twitter Card;
- imagem social de 1200 × 630 pixels;
- texto alternativo da imagem;
- favicon em SVG.

Arquivos relacionados:

```text
assets/favicon.svg
assets/og-image.svg
assets/og-image.png
```

Os metadados usam atualmente o domínio:

```text
https://qrcoderapido.netlify.app/
```

Caso o projeto seja movido para outro domínio, devem ser atualizados:

- `canonical`;
- `og:url`;
- `og:image`;
- `twitter:image`.

## Licenças

### Projeto

O QR Code Rápido utiliza licença MIT, formalizada no arquivo `LICENSE`.

```text
Copyright (c) 2026 Robson Junior
```

### Biblioteca

A licença original da biblioteca está preservada em:

```text
vendor/qrcode.LICENSE
```

O resumo das dependências está em:

```text
THIRD_PARTY_NOTICES.md
```

“QR Code” é marca registrada da DENSO WAVE INCORPORATED. A especificação do QR
Code é pública e seu uso padronizado é permitido conforme as condições
explicadas pela própria empresa:

https://www.qrcode.com/en/faq.html

## Testes

Os testes utilizam o módulo nativo `node:test`. Não existem dependências de
desenvolvimento para instalar.

Para executar:

```bash
npm test
```

### Testes de URL

O arquivo `test/url-utils.test.js` verifica:

- HTTPS válido;
- inclusão automática de HTTPS;
- remoção de espaços;
- localhost;
- campo vazio;
- texto inválido;
- protocolos não permitidos;
- hostname estruturalmente inválido.

### Testes do projeto

O arquivo `test/project.test.js` verifica:

- carregamento local da biblioteca;
- ausência de referência ao jsDelivr;
- margem de quatro módulos;
- configuração do PNG em 1024 pixels;
- geração de SVG;
- geração real de um SVG válido pela biblioteca incorporada;
- metadados sociais;
- favicon e imagem social;
- licenças do projeto e da dependência.
- páginas educativa e de privacidade;
- governança e templates de contribuição;
- política de segurança e `security.txt`;
- integração estrutural do botão de cópia.

### Testes de integridade

`test/vendor.test.js`:

- lê `qrcode.min.js` como buffer;
- calcula SHA-256 com `node:crypto`;
- valida o formato do hash versionado;
- compara o resultado com `vendor/qrcode.sha256`.

### Testes da área de transferência

`test/scripts.test.js` usa mocks para verificar:

- criação de `ClipboardItem` com `image/png`;
- chamada a `clipboard.write`;
- feedback de sucesso;
- botão oculto e desabilitado sem suporte;
- botão visível em ambiente compatível;
- erro de permissão tratado sem travar a interface.

## Execução local

O site pode ser aberto diretamente pelo `index.html`, mas um servidor local
representa melhor o comportamento do deploy.

Com Python:

```bash
python -m http.server 8000
```

Depois, acesse:

```text
http://localhost:8000/
```

Não é necessário executar `npm install`.

## Deploy no Netlify

O projeto possui um build de empacotamento, sem transformação do código. Ele
recria `dist/` com uma lista explícita de arquivos públicos:

```bash
npm run build
```

O Netlify usa `netlify.toml` para executar:

```text
npm test && npm run build
```

Somente `dist/` é publicado. Se os testes, o hash do vendor ou o empacotamento
falharem, uma nova versão não entra em produção.

O script inclui no deploy:

- `index.html`;
- `styles.css`;
- `scripts.js`;
- `url-utils.js`;
- `clipboard-utils.js`;
- pasta `assets`;
- pasta `vendor`.
- `sobre-qr-estatico.html`;
- `privacidade.html`;
- `SECURITY.md`;
- pasta `.well-known`.

Testes, documentação interna, templates do GitHub e `node_modules` permanecem
fora de `dist/`.

Os templates de `.github/` pertencem ao repositório e não precisam fazer parte
do diretório publicado no Netlify.

`node_modules/` também não faz parte do site e está listado em `.gitignore`.
Em um deploy manual emergencial, envie a pasta `dist/`, nunca a raiz inteira.

## Pipeline GitHub e Netlify

O fluxo oficial é:

```text
alteração local
      ↓
npm test
      ↓
commit e push no GitHub
      ↓
GitHub Actions: npm ci → npm test → npm run build
      ↓
Netlify: npm test → npm run build
      ↓
publicação de dist/
```

`.github/workflows/ci.yml` executa em pushes para `main` e em pull requests.
Além dos testes, ele guarda `dist/` como artefato temporário para inspeção.

O Netlify continua sendo responsável pelo deploy de produção e preserva o
domínio atual.

### Verificação pós-deploy

Depois de cada publicação:

1. abrir a página em uma janela anônima;
2. gerar um QR Code com e sem protocolo;
3. conferir o destino mostrado;
4. testar o código com outro dispositivo;
5. baixar e abrir o PNG;
6. baixar e abrir o SVG;
7. testar o layout no celular;
8. testar “Copiar imagem” em navegador compatível;
9. abrir `/sobre-qr-estatico` e `/privacidade`;
10. abrir `/.well-known/security.txt`;
11. verificar a prévia social;
12. executar `npm test` na versão local correspondente.

Serviços sociais podem manter imagens em cache. Quando a imagem Open Graph for
alterada, pode ser necessário solicitar nova leitura nas ferramentas das
plataformas.

## Limitações conhecidas

- QR Codes estáticos não permitem trocar o destino depois da impressão.
- A disponibilidade da página de destino não é monitorada.
- URLs muito longas geram códigos mais densos.
- A aplicação não oferece personalização de cores ou logotipos.
- Não existem estatísticas de leitura.
- Não existe histórico de códigos gerados.
- O nível de correção de erro é fixo em `M`.
- O PNG possui resolução fixa de 1024 × 1024 pixels.

Essas limitações são compatíveis com o objetivo atual: resolver de forma
transparente a geração de um QR Code estático.

## Decisões de produto

### Por que estático?

Porque o problema original era a dependência de uma plataforma que controlava
o redirecionamento. No formato atual, o endereço fica gravado no próprio
código.

### Por que não verificar se a URL está online?

Uma verificação desse tipo exigiria uma requisição externa, poderia expor o
endereço informado e ainda produzir falsos negativos por CORS, autenticação ou
bloqueios temporários.

### Por que PNG e SVG?

O PNG atende usos cotidianos. O SVG atende materiais que precisam de ampliação
sem perda de qualidade.

### Por que hospedar a biblioteca localmente?

Para que a geração não dependa da disponibilidade ou de alterações silenciosas
de um CDN.

### Por que não adicionar conta ou histórico?

Esses recursos exigiriam armazenamento e ampliariam o escopo. A proposta atual
é gerar o arquivo com o mínimo de dependências.

## Próximas evoluções possíveis

Sem comprometer a proposta principal, o projeto pode evoluir com:

- testes automatizados em navegador;
- seleção de resolução;
- modo de impressão;
- download em PDF;
- suporte opcional a texto, telefone, e-mail e Wi-Fi;
- cabeçalhos de segurança no Netlify;
- domínio próprio.

Personalização visual, QR dinâmico, analytics e contas devem ser tratados como
produtos ou fases separadas, pois introduzem novas dependências e compromissos
operacionais.

## Resumo final

O QR Code Rápido evoluiu de uma prova de conceito de três arquivos para um MVP
estático, testado e documentado.

A aplicação atual:

- valida o endereço;
- mostra exatamente o que será codificado;
- gera o QR Code no navegador;
- não utiliza redirecionamento intermediário;
- não armazena dados;
- entrega PNG em alta resolução e SVG;
- copia o QR como imagem quando o navegador permite;
- incorpora sua própria dependência;
- verifica a integridade dessa dependência por SHA-256;
- possui licenças, acessibilidade e metadados;
- publica conteúdo educativo, privacidade e segurança;
- possui regras e templates de contribuição;
- é validada por uma suíte automatizada.

O princípio original foi preservado durante toda a evolução: depois que o QR
Code é baixado ou impresso, seu funcionamento não depende da continuidade do
gerador.
