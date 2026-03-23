import { useState } from 'react'

export default function App() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    affected_service: '',
    requester: '',
    environment: '',
    incident_number: '',
  })

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>AI Triage Workbench</h1>
      <p>Enter incident details below and click Analyze.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Title — required */}
        <label>
          <strong>Short Title *</strong>
          <input
            type="text"
            value={form.title}
            onChange={e => updateField('title', e.target.value)}
            placeholder="e.g. VPN authentication failing after password reset"
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>

        {/* Description — required, multiline */}
        <label>
          <strong>Detailed Description *</strong>
          <textarea
            value={form.description}
            onChange={e => updateField('description', e.target.value)}
            rows={5}
            placeholder="What happened? When did it start? What has the user tried?"
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>

        {/* Affected Service — dropdown */}
        <label>
          <strong>Affected Service</strong>
          <select
            value={form.affected_service}
            onChange={e => updateField('affected_service', e.target.value)}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          >
            <option value="">Select a service...</option>
            <option value="VPN">VPN</option>
            <option value="Email">Email</option>
            <option value="Software">Software</option>
            <option value="Hardware">Hardware</option>
            <option value="Network">Network</option>
            <option value="Access/Authentication">Access / Authentication</option>
            <option value="Other">Other</option>
          </select>
        </label>

        {/* Environment — dropdown */}
        <label>
          <strong>Environment</strong>
          <select
            value={form.environment}
            onChange={e => updateField('environment', e.target.value)}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          >
            <option value="">Select...</option>
            <option value="Remote">Remote</option>
            <option value="Office">Office</option>
            <option value="Laptop">Laptop</option>
            <option value="VPN">VPN</option>
            <option value="Mobile">Mobile</option>
          </select>
        </label>

        {/* Requester — free text */}
        <label>
          <strong>Requester Name / ID</strong>
          <input
            type="text"
            value={form.requester}
            onChange={e => updateField('requester', e.target.value)}
            placeholder="e.g. Jane Doe"
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>

        {/* Optional existing incident number */}
        <label>
          <strong>Existing Incident # (optional)</strong>
          <input
            type="text"
            value={form.incident_number}
            onChange={e => updateField('incident_number', e.target.value)}
            placeholder="e.g. INC0012345"
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>

        <button
          onClick={() => alert('Step 3 will wire this up!')}
          style={{ padding: '12px 24px', fontSize: 16, cursor: 'pointer' }}
        >
          Analyze Incident
        </button>
      </div>
    </div>
  )
}
