import { useState } from 'react'
import { triageIncident } from './triage.js'
import { SAMPLE_INCIDENTS } from './samples.js'
import TriageResults from './triageResult.jsx'
import { searchKnowledgeBase } from './retrieval.js'
import { generateResolution } from './resolution.js'
import ResolutionResults from './ResolutionResults.jsx'
import ApprovalReview from './ApprovalReview.jsx'
import SuccessScreen from './SuccessScreen.jsx'
import { createIncident, updateIncident } from './servicenow.js'


export default function App() {
    const [form, setForm] = useState({
        title: '',
        description: '',
        affected_service: '',
        requester: '',
        environment: '',
        incident_number: '',
    })

    const [phase, setPhase] = useState('intake') // 'form' | 'loading' | 'result'
    const [triageResult, setTriageResult] = useState(null)
    const [error, setError] = useState(null)
    const [kbResults, setKbResults] = useState(null)
    const [resolution, setResolution] = useState(null)
    const [snowResult, setSnowResult] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const updateField = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const handleAnalyze = async () => {
        // Validate required fields
        if (!form.title.trim() || !form.description.trim()) {
            setError('Title and description are required.')
            return
        }

        setPhase('analyzing')
        setError(null)

        try {
            const result = await triageIncident(form)
            setTriageResult(result)
            setPhase('results')
            console.log('Triage result:', result)
        } catch (err) {
            console.error('Triage failed:', err)
            setError(err.message)
            setPhase('intake')
        }
    }

    const handleReset = () => {
        setPhase('intake')
        setForm({ title: '', description: '', affected_service: '', requester: '', environment: '', incident_number: '' })
        setTriageResult(null)
        setKbResults(null)
        setResolution(null)
        setSnowResult(null)
        setError(null)
        setIsSubmitting(false)
      }

    const loadSample = (sample) => {
        setForm({ ...sample, incident_number: '' })
        setError(null)
    }

    const handleSearchKB = async () => {
        setPhase('searching')
        setError(null)
    
        try {
          // Step 1: Search the KB
          const articles = searchKnowledgeBase(form)
          setKbResults(articles)
    
          // Step 2: Call Claude with incident + triage + KB articles
          const draft = await generateResolution(form, triageResult, articles)
          setResolution(draft)
          setPhase('resolution')
        } catch (err) {
          console.error('Resolution failed:', err)
          setError(err.message)
          setPhase('results') // fall back to triage results
        }
    }

    const handleBackToTriage = () => {
        setPhase('results')
        setResolution(null)
    }

    // Move from resolution screen to approval screen
const handleProceedToApproval = () => {
    setPhase('approval')
}

// Handle ServiceNow writeback
const handleApprove = async (approvedFields) => {
    setIsSubmitting(true)
    setError(null)

    try {
        let result

        if (form.incident_number && form.incident_number.trim()) {
            // Update existing incident
            result = await updateIncident(form.incident_number.trim(), approvedFields)
            result._isUpdate = true
        } else {
            // Create new incident
            result = await createIncident(approvedFields)
            result._isUpdate = false
        }

        setSnowResult(result)
        setPhase('success')
    } catch (err) {
        console.error('ServiceNow write failed:', err)
        setError(`ServiceNow write failed: ${err.message}. Your analysis is preserved — you can retry.`)
        // Stay on approval screen so nothing is lost
    } finally {
        setIsSubmitting(false)
    }
}

// Reject — go back to intake, clear everything
const handleReject = () => {
    handleReset()
}

// Regenerate — re-run KB search and resolution with same form data
const handleRegenerate = async () => {
    setPhase('searching')
    setError(null)

    try {
        const articles = searchKnowledgeBase(form)
        setKbResults(articles)
        const draft = await generateResolution(form, triageResult, articles)
        setResolution(draft)
        setPhase('resolution')
    } catch (err) {
        console.error('Regeneration failed:', err)
        setError(err.message)
        setPhase('resolution') // fall back to previous resolution
    }
}



    return (
        <div style={{ maxWidth: 700, margin: '40px auto', fontFamily: 'sans-serif' }}>
            <h1>AI Triage Workbench</h1>

            {error && (
                <div
                    style={{
                        background: '#fef2f2',
                        border: '1px solid #fca5a5',
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 16,
                        color: '#991b1b',
                        fontSize: 14,
                    }}
                >
                    {error}
                </div>
            )}

            {/* Phase: Success */}
            {phase === 'success' && snowResult ? (
                <SuccessScreen
                    result={snowResult}
                    isUpdate={snowResult._isUpdate}
                    snowInstance={import.meta.env.VITE_SNOW_INSTANCE}
                    onNewIncident={handleReset}
                />
            ) : phase === 'approval' && triageResult && resolution ? (
                /* Phase: Approval review */
                <ApprovalReview
                    form={form}
                    triageResult={triageResult}
                    resolution={resolution}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onRegenerate={handleRegenerate}
                    isSubmitting={isSubmitting}
                />
            ) : phase === 'resolution' && resolution && kbResults ? (
                /* Phase: Resolution results */
                <ResolutionResults
                    kbResults={kbResults}
                    resolution={resolution}
                    onReset={handleReset}
                    onBack={handleBackToTriage}
                    onProceedToApproval={handleProceedToApproval}
                />
            ) : phase === 'searching' ? (
                /* Phase: Searching */
                <p>Searching knowledge base and generating resolution...</p>
            ) : phase === 'results' && triageResult ? (
                /* Phase: Triage results */
                <TriageResults
                    result={triageResult}
                    onReset={handleReset}
                    onSearchKB={handleSearchKB}
                />
            ) : (
                <>
                    <p>Enter incident details below and click Analyze.</p>
                    <div style={{ marginBottom: 20 }}>
                        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
                            Quick load a sample:
                        </p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {SAMPLE_INCIDENTS.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => loadSample(s)}
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: 12,
                                        background: '#f3f4f6',
                                        border: '1px solid #d1d5db',
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {s.title.slice(0, 30)}...
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Title — required */}
                        <label>
                            <strong>Short Title *</strong>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => updateField('title', e.target.value)}
                                placeholder="e.g. VPN authentication failing after password reset"
                                style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
                            />
                        </label>

                        {/* Description — required, multiline */}
                        <label>
                            <strong>Detailed Description *</strong>
                            <textarea
                                value={form.description}
                                onChange={(e) => updateField('description', e.target.value)}
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
                                onChange={(e) => updateField('affected_service', e.target.value)}
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
                                onChange={(e) => updateField('environment', e.target.value)}
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
                                onChange={(e) => updateField('requester', e.target.value)}
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
                                onChange={(e) => updateField('incident_number', e.target.value)}
                                placeholder="e.g. INC0012345"
                                style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
                            />
                        </label>

                        <button
                            onClick={handleAnalyze}
                            disabled={phase === 'analyzing'}
                            style={{ padding: '12px 24px', fontSize: 16, cursor: 'pointer' }}
                        >
                            {phase === 'analyzing' ? 'Analyzing...' : 'Analyze Incident'}
                        </button>
                        {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}
                    </div>
                </>
            )}
        </div>
    )
}