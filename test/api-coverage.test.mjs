import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { apiPaths, currentBackendApi, productionUrls } from "../src/endpoints.js";

const publishedOpenApi = new Set([
  "GET /healthz",
  "GET /readyz",
  "POST /platform/v1/whatsapp/contacts/eligibility",
  "POST /platform/v1/whatsapp/campaigns/validate",
  "POST /platform/v1/whatsapp/messages"
]);

test("frontend catalog covers every currently published WhatsApp API endpoint", () => {
  const frontend = new Set(currentBackendApi.map((item) => item.method + " " + item.path));
  assert.deepEqual(frontend, publishedOpenApi);
});

test("browser-facing endpoint map never points at internal provider services", () => {
  assert.equal(productionUrls.api, "https://api.codestra.co");
  assert.equal(apiPaths.messages, "/platform/v1/whatsapp/messages");
  for (const item of currentBackendApi) assert.ok(!item.path.startsWith("/internal/"));
});

test("current endpoints have concrete API client bindings", () => {
  const source = fs.readFileSync(new URL("../src/api.js", import.meta.url), "utf8");
  for (const binding of ["health:", "ready:", "eligibility:", "validateCampaign:", "sendMessage:"]) {
    assert.match(source, new RegExp(binding.replace(":", "\\:")));
  }
});


test("sendMessage bridges the frontend model to the current backend contract", () => {
  const source = fs.readFileSync(new URL("../src/api.js", import.meta.url), "utf8");
  for (const required of ["tenant_id:", "requested_by:", "idempotency_key:"]) {
    assert.match(source, new RegExp(required.replace(":", "\\:")));
  }
  const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  for (const required of ["recipient: contact.phone", "consent_status: contact.consent_status", "suppressed:", "opted_out:"]) {
    assert.ok(app.includes(required), "missing send contract field: " + required);
  }
});
