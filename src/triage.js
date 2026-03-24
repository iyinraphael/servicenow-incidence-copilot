import { TRIAGE_SYSTEM_PROMPT  } from "./prompts";

export async function triageIncident(form) {

    const userMessage = [
        `Title: ${form.title}`,
        `Description: ${form.description}`,
        `Affected Service: ${form.affected_service || 'Not specified'}`,
        `Requester: ${form.requester || 'Not specified'}`,
        `Environment: ${form.environment || 'Not specified'}`,
        form.incident_number ? `Existing Incident: ${form.incident_number}` : ``,
    ].filter(Boolean).join('\n');

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
          max_tokens: 1024,
          system: TRIAGE_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userMessage }],
        }),
      })

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API error ${response.status}: ${errText}`);
    }
    
    // Step 4d: Extract text from Claude's response
    const data = await response.json();
    const text = data.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('');
    
    // Step 4e: Clean and parse JSON
    // Sometimes Claude wraps JSON in ```json ... ``` despite instructions.
    // This strip is defensive — handle the real world, not the ideal one.
    const cleaned = text.replace(/```json\s*|```\s*/g, '').trim();
    
    try {
        return JSON.parse(cleaned);
    } catch (parseErr) {
        console.error('Raw Claude response:', text);
        throw new Error('Claude returned invalid JSON. Check console for raw response.');
    }
}