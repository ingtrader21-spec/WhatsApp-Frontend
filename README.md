# Codestra WhatsApp Frontend

Separate web application for the Codestra WhatsApp agent console.

## Boundary

This repository contains **frontend code only**.

```text
Browser
  -> WhatsApp-Frontend
  -> WhatsApp business/API service
  -> Middleware V3 :8095
  -> Evolution-API
  -> Meta / WhatsApp
```

The browser never calls Evolution-API or Meta directly and never owns the command ledger, retries, replay, reconciliation, consent authority, or provider credentials.

## Console surfaces

- Overview / operational dashboard
- Agent inbox and conversation timeline
- Contact directory with consent-aware records
- Message templates
- Campaign drafts and validation
- Operator/session settings
- Keycloak Authorization Code + PKCE authentication foundation

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Production effects remain controlled by the backend and Middleware V3.
