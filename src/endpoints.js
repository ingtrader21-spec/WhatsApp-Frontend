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
