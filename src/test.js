import { searchKnowledgeBase } from './retrieval.js'

const testIncident = {
  title: 'VPN authentication failing after password reset',
  description: 'User reset password. VPN shows authentication failed.',
  affected_service: 'VPN',
}

const results = searchKnowledgeBase(testIncident)
console.log(results)


import { createIncident } from './servicenow.js'

// This will actually create an incident in your ServiceNow instance
const result = await createIncident({
  title: 'Test incident from AI Triage Workbench',
  description: 'This is a test. Please close.',
  impact: 'low',
  urgency: 'low',
  category: 'Software',
  work_notes: 'Created by AI Triage Workbench test.',
  comments: '',
})

console.log('Created:', result.number) // e.g., INC0010042