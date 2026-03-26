import { RESOLUTION_SYSTEM_PROMPT } from './prompts.js'

/**
 * Call Claude with the incident, triage result, and KB articles
 * to generate a grounded resolution recommendation.
 */
export async function generateResolution(incident, triageResult, kbResults) {
  // Step 4a: Build the user message
  // This combines all three inputs into a structured prompt.
  // Notice each section is clearly labeled — this helps Claude
  // distinguish between the incident, the triage, and the KB evidence.
  const userMessage = `=== INCIDENT ===
Title: ${incident.title}
Description: ${incident.description}
Affected Service: ${incident.affected_service || 'Not specified'}
Environment: ${incident.environment || 'Not specified'}
Requester: ${incident.requester || 'Not specified'}

=== TRIAGE RESULT ===
Summary: ${triageResult.incident_summary}
Category: ${triageResult.suggested_category} / ${triageResult.suggested_subcategory}
Impact: ${triageResult.suggested_impact}
Urgency: ${triageResult.suggested_urgency}
Priority: ${triageResult.suggested_priority}

=== KNOWLEDGE BASE ARTICLES ===
${kbResults.length === 0
  ? 'No relevant articles found.'
  : kbResults.map(kb => `--- Article ${kb.article_id}: ${kb.title} ---
${kb.full_content}`).join('\n\n')
}`

  // Step 4b: Make the API call
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: RESOLUTION_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`API error ${response.status}: ${errText}`)
  }

  // Step 4c: Parse the response
  const data = await response.json()
  const text = data.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('')

  const cleaned = text.replace(/```json\s*|```\s*/g, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch (parseErr) {
    console.error('Raw Claude response:', text)
    throw new Error('Claude returned invalid JSON for resolution. Check console.')
  }
}