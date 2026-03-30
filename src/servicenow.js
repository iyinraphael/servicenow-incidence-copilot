/**
 * ServiceNow REST API client.
 *
 * Two operations:
 *   createIncident() — POST to /api/now/table/incident
 *   updateIncident() — PATCH to /api/now/table/incident/{sys_id}
 *
 * Design decision: this module only sends analyst-approved data.
 * Raw model output never reaches ServiceNow — the approval screen
 * is the gate between Claude's suggestions and the write action.
 */

const SNOW_INSTANCE = import.meta.env.VITE_SNOW_INSTANCE
const SNOW_USERNAME = import.meta.env.VITE_SNOW_USERNAME
const SNOW_PASSWORD = import.meta.env.VITE_SNOW_PASSWORD

// ── Value mappings ──────────────────────────────────────────────
// ServiceNow uses numeric codes, your app uses readable strings.
// These mappings bridge the gap.

const IMPACT_MAP = { high: '1', medium: '2', low: '3' }
const URGENCY_MAP = { high: '1', medium: '2', low: '3' }

// ServiceNow category values vary by instance. These are the defaults
// on developer instances. If your instance uses different values,
// update this map. The keys are what your triage prompt returns.
const CATEGORY_MAP = {
  'Network': 'network',
  'Hardware': 'hardware',
  'Software': 'software',
  'Access/Authentication': 'software',   // SN default doesn't have this; map to closest
  'Email': 'software',                   // same — adjust if your instance has custom categories
  'Database': 'database',
  'Security': 'network',                 // adjust as needed
  'General Inquiry': 'inquiry',
}

/**
 * Build the ServiceNow payload from analyst-approved fields.
 *
 * This function takes the final, edited values from the approval screen —
 * NOT the raw Claude output. The analyst has already reviewed and modified
 * these fields before they reach this function.
 */
function buildPayload(approvedFields) {
  const payload = {
    short_description: approvedFields.title,
    description: approvedFields.description,
    impact: IMPACT_MAP[approvedFields.impact] || '2',
    urgency: URGENCY_MAP[approvedFields.urgency] || '2',
  }

  // Only include category if we have a valid mapping
  if (approvedFields.category && CATEGORY_MAP[approvedFields.category]) {
    payload.category = CATEGORY_MAP[approvedFields.category]
  }

  // Work notes and comments
  if (approvedFields.work_notes) {
    payload.work_notes = approvedFields.work_notes
  }
  if (approvedFields.comments) {
    payload.comments = approvedFields.comments
  }

  return payload
}

/**
 * Make an authenticated request to the ServiceNow REST API.
 */
async function snowRequest(endpoint, method, body = null) {
  if (!SNOW_INSTANCE || !SNOW_USERNAME || !SNOW_PASSWORD) {
    throw new Error(
      'ServiceNow credentials not configured. Add VITE_SNOW_INSTANCE, VITE_SNOW_USERNAME, and VITE_SNOW_PASSWORD to your .env file.'
    )
  }

  const url = `${SNOW_INSTANCE}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Basic ' + btoa(`${SNOW_USERNAME}:${SNOW_PASSWORD}`),
  }

  const options = { method, headers }
  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(url, options)

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`ServiceNow API error ${response.status}: ${errText}`)
  }

  return response.json()
}

/**
 * Create a new incident in ServiceNow.
 *
 * Returns the created incident record, including the auto-generated
 * incident number (e.g., INC0010001).
 */
export async function createIncident(approvedFields) {
  const payload = buildPayload(approvedFields)
  const result = await snowRequest('/api/now/table/incident', 'POST', payload)

  // ServiceNow wraps the response in a "result" key
  return {
    sys_id: result.result.sys_id,
    number: result.result.number,
    state: result.result.state,
    created: result.result.sys_created_on,
    fieldsWritten: payload,
  }
}

/**
 * Update an existing incident in ServiceNow.
 *
 * First looks up the incident by number to get the sys_id,
 * then PATCHes the record with the approved fields.
 */
export async function updateIncident(incidentNumber, approvedFields) {
  // Step 1: Look up the sys_id from the incident number
  const lookup = await snowRequest(
    `/api/now/table/incident?sysparm_query=number=${encodeURIComponent(incidentNumber)}&sysparm_fields=sys_id,number&sysparm_limit=1`,
    'GET'
  )

  if (!lookup.result || lookup.result.length === 0) {
    throw new Error(`Incident ${incidentNumber} not found in ServiceNow.`)
  }

  const sysId = lookup.result[0].sys_id

  // Step 2: PATCH the record
  const payload = buildPayload(approvedFields)
  const result = await snowRequest(
    `/api/now/table/incident/${sysId}`,
    'PATCH',
    payload
  )

  return {
    sys_id: result.result.sys_id,
    number: result.result.number,
    state: result.result.state,
    updated: result.result.sys_updated_on,
    fieldsWritten: payload,
  }
}