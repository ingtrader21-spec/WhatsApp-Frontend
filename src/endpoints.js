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

export const apiPaths = Object.freeze({
  health: "/healthz",
  ready: "/readyz",
  me: "/platform/v1/whatsapp/me",
  dashboard: "/platform/v1/whatsapp/dashboard",
  contacts: "/platform/v1/whatsapp/contacts",
  templates: "/platform/v1/whatsapp/templates",
  campaigns: "/platform/v1/whatsapp/campaigns",
  messages: "/platform/v1/whatsapp/messages",
  conversations: "/platform/v1/whatsapp/conversations",
  deadLetters: "/platform/v1/whatsapp/dead-letters"
});

export function canonicalApiUrl(path) {
  return productionUrls.api + path;
}
