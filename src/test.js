import { searchKnowledgeBase } from './retrieval.js'

const testIncident = {
  title: 'VPN authentication failing after password reset',
  description: 'User reset password. VPN shows authentication failed.',
  affected_service: 'VPN',
}

const results = searchKnowledgeBase(testIncident)
console.log(results)