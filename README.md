# ServiceNow Incident Copilot

An AI-powered triage workbench that analyzes IT incidents, searches a knowledge base, drafts resolutions, and writes approved results back to ServiceNow.

## What it does

1. **Intake** — analyst fills in incident details (or loads a sample)
2. **Triage** — Claude classifies the incident: category, priority, impact, urgency
3. **KB Search** — keyword matching against local knowledge base articles
4. **Resolution** — Claude drafts a resolution using the triage result + KB articles
5. **Approval** — analyst reviews and edits before anything is sent to ServiceNow
6. **Writeback** — creates or updates the incident in ServiceNow via REST API

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_SNOW_INSTANCE=https://your-instance.service-now.com
VITE_SNOW_USERNAME=admin
VITE_SNOW_PASSWORD=your-password
```

| Variable | Where to get it |
|---|---|
| `VITE_ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) → API Keys |
| `VITE_SNOW_INSTANCE` | Your ServiceNow instance URL (no trailing slash) |
| `VITE_SNOW_USERNAME` | ServiceNow admin or service account username |
| `VITE_SNOW_PASSWORD` | ServiceNow account password |

> `.env` is gitignored — never commit it.

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Important files

### Knowledge base — `src/data/kb_articles.json`

The local knowledge base. Each article has this shape:

```json
{
  "article_id": "KB001",
  "title": "VPN Login Failure After Active Directory Password Reset",
  "category": "Access/Authentication",
  "services": ["VPN", "Active Directory"],
  "keywords": ["vpn", "password", "reset", "authentication"],
  "content": "Full resolution steps...",
  "resolution_time_minutes": 15,
  "last_updated": "2025-01-10"
}
```

**To add your own articles:** edit `kb_articles.json` and add objects with the same shape. The `keywords` array is what drives search — be specific. The `services` array gives a scoring boost when the incident's affected service matches.

### KB search — `src/retrieval.js`

Keyword + service matching against `kb_articles.json`. No embeddings or vector DB — scores articles by keyword overlap and service match, returns the top 3. Simple and debuggable.

### AI triage — `src/triage.js`

Calls the Anthropic API directly from the browser. Sends the incident form to Claude and returns structured JSON (category, priority, impact, urgency, confidence note, follow-up questions).

### AI resolution — `src/resolution.js`

Second Claude call. Takes the incident, triage result, and top KB articles, and drafts a resolution note for the analyst to review.

### Prompts — `src/prompts.js`

All Claude system prompts live here. Edit this file to change how Claude classifies incidents or drafts resolutions.

### ServiceNow integration — `src/servicenow.js`

REST API client for ServiceNow. Two operations:

- `createIncident(approvedFields)` — POST to `/api/now/table/incident`
- `updateIncident(incidentNumber, approvedFields)` — PATCH to an existing incident

Uses Basic Auth with the credentials from `.env`. The category, impact, and urgency values are mapped from readable strings to ServiceNow numeric codes in this file — update `CATEGORY_MAP`, `IMPACT_MAP`, `URGENCY_MAP` if your instance uses different values.

### Sample incidents — `src/samples.js`

Three pre-filled incidents for quick testing. Edit or add to this array to change the quick-load buttons on the intake form.

---

## Testing the ServiceNow connection

```bash
npx vite-node src/test.js
```

This creates a real test incident in your ServiceNow instance. Close it manually after confirming it worked.

---

## Project structure

```
src/
├── data/
│   └── kb_articles.json     # Knowledge base articles
├── App.jsx                  # Main app shell, phase state machine
├── triage.js                # Claude API call for incident triage
├── retrieval.js             # KB keyword search
├── resolution.js            # Claude API call for resolution draft
├── servicenow.js            # ServiceNow REST API client
├── prompts.js               # All Claude system prompts
├── samples.js               # Sample incidents for quick testing
├── triageResult.jsx         # Triage results UI
├── ResolutionResults.jsx    # Resolution draft UI
├── ApprovalReview.jsx       # Analyst approval screen
└── SuccessScreen.jsx        # Post-writeback confirmation
```
