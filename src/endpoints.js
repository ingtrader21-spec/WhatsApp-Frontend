export const productionUrls = Object.freeze({
  frontend: "https://whatsapp.codestra.co",
  api: "https://api.codestra.co",
  keycloak: "https://auth.codestra.co",
  keycloakIssuer: "https://auth.codestra.co/realms/codestra",
  whatsappInternal: "http://whatsapp-app:8782",
  middlewareInternal: "http://middleware-integration-api:8095",
  middlewareCommands: "http://middleware-integration-api:8095/platform/v1/commands",
  evolutionInternal: "http://evolution-api:8781"
});

const whatsapp = "/platform/v1/whatsapp";

export const apiPaths = Object.freeze({
  health: "/healthz",
  ready: "/readyz",

  me: whatsapp + "/me",
  dashboard: whatsapp + "/dashboard",

  eligibility: whatsapp + "/contacts/eligibility",
  contacts: whatsapp + "/contacts",
  contact: (contactId) => whatsapp + "/contacts/" + encodeURIComponent(contactId),

  campaignValidation: whatsapp + "/campaigns/validate",
  campaigns: whatsapp + "/campaigns",
  campaign: (campaignId) => whatsapp + "/campaigns/" + encodeURIComponent(campaignId),

  templates: whatsapp + "/templates",
  template: (templateId) => whatsapp + "/templates/" + encodeURIComponent(templateId),

  messages: whatsapp + "/messages",
  operation: (operationId) => whatsapp + "/operations/" + encodeURIComponent(operationId),

  conversations: whatsapp + "/conversations",
  conversation: (conversationId) => whatsapp + "/conversations/" + encodeURIComponent(conversationId),
  timeline: (conversationId) => whatsapp + "/conversations/" + encodeURIComponent(conversationId) + "/timeline",
  claim: (conversationId) => whatsapp + "/conversations/" + encodeURIComponent(conversationId) + "/claim",
  assign: (conversationId) => whatsapp + "/conversations/" + encodeURIComponent(conversationId) + "/assign",
  escalate: (conversationId) => whatsapp + "/conversations/" + encodeURIComponent(conversationId) + "/escalate",
  resolve: (conversationId) => whatsapp + "/conversations/" + encodeURIComponent(conversationId) + "/resolve",
  reopen: (conversationId) => whatsapp + "/conversations/" + encodeURIComponent(conversationId) + "/reopen",
  automation: (conversationId, action) => whatsapp + "/conversations/" + encodeURIComponent(conversationId) + "/automation/" + encodeURIComponent(action),

  deadLetters: whatsapp + "/dead-letters",
  replayDeadLetter: (deadLetterId) => whatsapp + "/dead-letters/" + encodeURIComponent(deadLetterId) + "/replay",

  internalMetrics: "/internal/metrics",
  inboundEvents: "/internal/v1/inbound-events",
  inboundEvent: (eventId) => "/internal/v1/inbound-events/" + encodeURIComponent(eventId)
});

export function canonicalApiUrl(path) {
  return productionUrls.api + path;
}

export const publicApiUrls = Object.freeze({
  health: canonicalApiUrl(apiPaths.health),
  ready: canonicalApiUrl(apiPaths.ready),
  me: canonicalApiUrl(apiPaths.me),
  dashboard: canonicalApiUrl(apiPaths.dashboard),
  eligibility: canonicalApiUrl(apiPaths.eligibility),
  contacts: canonicalApiUrl(apiPaths.contacts),
  campaignValidation: canonicalApiUrl(apiPaths.campaignValidation),
  campaigns: canonicalApiUrl(apiPaths.campaigns),
  templates: canonicalApiUrl(apiPaths.templates),
  messages: canonicalApiUrl(apiPaths.messages),
  conversations: canonicalApiUrl(apiPaths.conversations),
  deadLetters: canonicalApiUrl(apiPaths.deadLetters)
});


export const currentBackendApi = Object.freeze([
  { key: "health", method: "GET", path: apiPaths.health, purpose: "Application health" },
  { key: "ready", method: "GET", path: apiPaths.ready, purpose: "Safe-mode and Middleware readiness" },
  { key: "eligibility", method: "POST", path: apiPaths.eligibility, purpose: "Recipient eligibility decision" },
  { key: "campaignValidation", method: "POST", path: apiPaths.campaignValidation, purpose: "Campaign validation" },
  { key: "messages", method: "POST", path: apiPaths.messages, purpose: "Submit eligible message effect through Middleware V3" }
]);

export const plannedApplicationApi = Object.freeze([
  { method: "GET", path: apiPaths.me, purpose: "Operator identity" },
  { method: "GET", path: apiPaths.dashboard, purpose: "Operational dashboard" },
  { method: "GET/POST", path: apiPaths.contacts, purpose: "Contact directory" },
  { method: "GET/PATCH", path: apiPaths.contact(":contactId"), purpose: "Contact detail" },
  { method: "GET/POST", path: apiPaths.templates, purpose: "Template workspace" },
  { method: "GET/PATCH", path: apiPaths.template(":templateId"), purpose: "Template detail" },
  { method: "GET/POST", path: apiPaths.campaigns, purpose: "Campaign workspace" },
  { method: "GET/PATCH", path: apiPaths.campaign(":campaignId"), purpose: "Campaign detail" },
  { method: "GET", path: apiPaths.conversations, purpose: "Inbox" },
  { method: "GET", path: apiPaths.conversation(":conversationId"), purpose: "Conversation detail" },
  { method: "GET", path: apiPaths.timeline(":conversationId"), purpose: "Conversation timeline" },
  { method: "POST", path: apiPaths.claim(":conversationId"), purpose: "Claim conversation" },
  { method: "POST", path: apiPaths.assign(":conversationId"), purpose: "Assign conversation" },
  { method: "POST", path: apiPaths.escalate(":conversationId"), purpose: "Escalate conversation" },
  { method: "POST", path: apiPaths.resolve(":conversationId"), purpose: "Resolve conversation" },
  { method: "POST", path: apiPaths.reopen(":conversationId"), purpose: "Reopen conversation" },
  { method: "POST", path: apiPaths.automation(":conversationId", ":action"), purpose: "Pause/resume automation" },
  { method: "GET", path: apiPaths.deadLetters, purpose: "Dead-letter queue" },
  { method: "POST", path: apiPaths.replayDeadLetter(":deadLetterId"), purpose: "Safe replay request" },
  { method: "GET", path: apiPaths.operation(":operationId"), purpose: "Operation readback" }
]);
