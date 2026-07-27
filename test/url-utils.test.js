const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeUrl } = require("../url-utils.js");

test("mantém uma URL HTTPS válida", () => {
  assert.equal(
    normalizeUrl("https://exemplo.com/pagina?origem=teste"),
    "https://exemplo.com/pagina?origem=teste"
  );
});

test("adiciona HTTPS quando o protocolo não foi informado", () => {
  assert.equal(
    normalizeUrl("exemplo.com/minha-pagina"),
    "https://exemplo.com/minha-pagina"
  );
});

test("remove espaços das extremidades", () => {
  assert.equal(
    normalizeUrl("  https://exemplo.com/  "),
    "https://exemplo.com/"
  );
});

test("aceita localhost para desenvolvimento", () => {
  assert.equal(
    normalizeUrl("localhost:3000/teste"),
    "https://localhost:3000/teste"
  );
});

test("rejeita campo vazio", () => {
  assert.throws(
    () => normalizeUrl("   "),
    /Cole um endereço/
  );
});

test("rejeita texto que não parece um endereço", () => {
  assert.throws(
    () => normalizeUrl("apenas um texto"),
    /Informe um endereço completo/
  );
});

test("rejeita protocolos que não sejam HTTP ou HTTPS", () => {
  assert.throws(
    () => normalizeUrl("ftp://exemplo.com/arquivo"),
    /http:\/\/ ou https:\/\//
  );
});

test("rejeita uma URL estruturalmente inválida", () => {
  assert.throws(
    () => normalizeUrl("https://."),
    /domínio válido/
  );
});

test("rejeita hostname sem TLD", () => {
  assert.throws(
    () => normalizeUrl("https://exemplo"),
    /não parece um domínio válido/
  );
});

test("rejeita hostname de uma letra só, sem ponto", () => {
  assert.throws(
    () => normalizeUrl("https://a"),
    /não parece um domínio válido/
  );
});

test("aceita localhost sem porta", () => {
  assert.equal(normalizeUrl("localhost/teste"), "https://localhost/teste");
});

test("aceita localhost com porta", () => {
  assert.equal(
    normalizeUrl("http://localhost:8080/teste"),
    "http://localhost:8080/teste"
  );
});

test("aceita IPv4 literal", () => {
  assert.equal(
    normalizeUrl("http://192.168.0.1:3000/painel"),
    "http://192.168.0.1:3000/painel"
  );
});

test("aceita IPv6 literal", () => {
  assert.equal(normalizeUrl("http://[::1]:3000/"), "http://[::1]:3000/");
});
