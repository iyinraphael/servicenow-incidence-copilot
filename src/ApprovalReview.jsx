import { useState } from 'react'

/**
 * ApprovalReview — editable review screen before ServiceNow writeback.
 *
 * Design principle: every field Claude suggested is editable.
 * The analyst is the final authority, not the model.
 *
 * Props:
 *   form — original incident form data
 *   triageResult — Claude's triage output
 *   resolution — Claude's resolution output
 *   onApprove(approvedFields) — called with the final edited fields
 *   onReject() — returns to intake
 *   onRegenerate() — re-runs Phase 2 (KB search + resolution)
 *   isSubmitting — true while ServiceNow call is in progress
 */
export default function ApprovalReview({
  form,
  triageResult,
  resolution,
  onApprove,
  onReject,
  onRegenerate,
  isSubmitting,
}) {
  // Initialize editable fields from Claude's suggestions
  // These are the values the analyst can modify before approval.
  const [fields, setFields] = useState({
    title: form.title,
    description: form.description,
    category: triageResult.suggested_category,
    subcategory: triageResult.suggested_subcategory,
    impact: triageResult.suggested_impact,
    urgency: triageResult.suggested_urgency,
    priority: triageResult.suggested_priority,
    work_notes: buildWorkNotes(resolution, triageResult),
    comments: resolution.user_facing_update || '',
  })

  const update = (field, value) => setFields(prev => ({ ...prev, [field]: value }))

  // Track whether the analyst has made any edits (for the UI)
  const [edited, setEdited] = useState(false)
  const handleUpdate = (field, value) => {
    update(field, value)
    setEdited(true)
  }

  // ── Styles ──────────────────────────────────────────────────
  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 4,
  }
  const inputStyle = {
    display: 'block',
    width: '100%',
    padding: 8,
    fontSize: 14,
    border: '1px solid #d1d5db',
    borderRadius: 6,
    boxSizing: 'border-box',
  }
  const textareaStyle = {
    ...inputStyle,
    fontFamily: 'inherit',
    lineHeight: 1.5,
    resize: 'vertical',
  }
  const sectionStyle = {
    marginBottom: 20,
  }
  const rowStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, marginBottom: 4 }}>Review & Approve</h2>
      <p style={{ color: '#6b7280', fontSize: 14, marginTop: 0, marginBottom: 24 }}>
        Review the AI-generated fields below. Edit anything before submitting to ServiceNow.
        {edited && (
          <span style={{ color: '#b45309', marginLeft: 8, fontWeight: 600 }}>
            (Modified)
          </span>
        )}
      </p>

      {/* ── Incident Details ───────────────────────────────── */}
      <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, marginBottom: 20 }}>
        <legend style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', padding: '0 8px' }}>
          Incident Details
        </legend>

        <div style={sectionStyle}>
          <label style={labelStyle}>Short Title (short_description)</label>
          <input
            type="text"
            value={fields.title}
            onChange={e => handleUpdate('title', e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>Full Description (description)</label>
          <textarea
            value={fields.description}
            onChange={e => handleUpdate('description', e.target.value)}
            rows={4}
            style={textareaStyle}
          />
        </div>
      </fieldset>

      {/* ── Classification ─────────────────────────────────── */}
      <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, marginBottom: 20 }}>
        <legend style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', padding: '0 8px' }}>
          Classification
        </legend>

        <div style={rowStyle}>
          <div style={sectionStyle}>
            <label style={labelStyle}>Category</label>
            <select
              value={fields.category}
              onChange={e => handleUpdate('category', e.target.value)}
              style={inputStyle}
            >
              <option value="Network">Network</option>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Access/Authentication">Access / Authentication</option>
              <option value="Email">Email</option>
              <option value="Database">Database</option>
              <option value="Security">Security</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>
          </div>

          <div style={sectionStyle}>
            <label style={labelStyle}>Subcategory</label>
            <input
              type="text"
              value={fields.subcategory}
              onChange={e => handleUpdate('subcategory', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={rowStyle}>
          <div style={sectionStyle}>
            <label style={labelStyle}>Impact</label>
            <select
              value={fields.impact}
              onChange={e => handleUpdate('impact', e.target.value)}
              style={inputStyle}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div style={sectionStyle}>
            <label style={labelStyle}>Urgency</label>
            <select
              value={fields.urgency}
              onChange={e => handleUpdate('urgency', e.target.value)}
              style={inputStyle}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div style={{ ...sectionStyle, maxWidth: '50%' }}>
          <label style={labelStyle}>Priority</label>
          <select
            value={fields.priority}
            onChange={e => handleUpdate('priority', e.target.value)}
            style={inputStyle}
          >
            <option value="P1">P1 — Critical</option>
            <option value="P2">P2 — High</option>
            <option value="P3">P3 — Moderate</option>
            <option value="P4">P4 — Low</option>
          </select>
        </div>
      </fieldset>

      {/* ── Notes ──────────────────────────────────────────── */}
      <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, marginBottom: 20 }}>
        <legend style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', padding: '0 8px' }}>
          Notes
        </legend>

        <div style={sectionStyle}>
          <label style={labelStyle}>
            User-Facing Comment
            <span style={{ fontWeight: 400, color: '#6b7280' }}> — visible to the requester</span>
          </label>
          <textarea
            value={fields.comments}
            onChange={e => handleUpdate('comments', e.target.value)}
            rows={4}
            style={textareaStyle}
          />
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>
            Internal Work Notes
            <span style={{ fontWeight: 400, color: '#6b7280' }}> — only visible to the support team</span>
          </label>
          <textarea
            value={fields.work_notes}
            onChange={e => handleUpdate('work_notes', e.target.value)}
            rows={6}
            style={textareaStyle}
          />
        </div>
      </fieldset>

      {/* ── Action Buttons ─────────────────────────────────── */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginTop: 28,
        paddingTop: 20,
        borderTop: '1px solid #e5e7eb',
      }}>
        <button
          onClick={onReject}
          disabled={isSubmitting}
          style={{
            padding: '10px 20px', fontSize: 14, cursor: 'pointer',
            background: '#fef2f2', color: '#991b1b',
            border: '1px solid #fca5a5', borderRadius: 6,
          }}
        >
          Reject
        </button>

        <button
          onClick={onRegenerate}
          disabled={isSubmitting}
          style={{
            padding: '10px 20px', fontSize: 14, cursor: 'pointer',
            background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6,
          }}
        >
          Regenerate
        </button>

        <div style={{ flex: 1 }} /> {/* spacer pushes approve to the right */}

        <button
          onClick={() => onApprove(fields)}
          disabled={isSubmitting || !fields.title.trim()}
          style={{
            padding: '10px 24px', fontSize: 14, fontWeight: 600,
            cursor: isSubmitting ? 'wait' : 'pointer',
            background: isSubmitting ? '#9ca3af' : '#16a34a',
            color: 'white', border: 'none', borderRadius: 6,
          }}
        >
          {isSubmitting
            ? 'Writing to ServiceNow...'
            : form.incident_number
              ? `Update ${form.incident_number}`
              : 'Create Incident in ServiceNow'
          }
        </button>
      </div>
    </div>
  )
}

/**
 * Build work notes from the resolution and triage result.
 *
 * This assembles a block of text that includes:
 *   - the root cause
 *   - the recommended steps
 *   - the source KB articles
 *   - the evidence strength
 *
 * The analyst can then edit this before submission.
 */
function buildWorkNotes(resolution, triageResult) {
  const lines = []

  lines.push('=== AI Triage Analysis ===')
  lines.push(`Summary: ${triageResult.incident_summary}`)
  lines.push(`Confidence: ${triageResult.confidence_note}`)
  lines.push('')
  lines.push('=== Root Cause Analysis ===')
  lines.push(resolution.likely_root_cause)
  lines.push('')
  lines.push('=== Recommended Steps ===')
  resolution.recommended_next_steps.forEach((step, i) => {
    lines.push(`${i + 1}. ${step}`)
  })
  lines.push('')
  lines.push(`Evidence Strength: ${resolution.evidence_strength}`)

  if (resolution.source_article_ids?.length > 0) {
    lines.push(`Source Articles: ${resolution.source_article_ids.join(', ')}`)
  }

  return lines.join('\n')
}