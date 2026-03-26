export default function ResolutionResults({ kbResults, resolution, onReset, onBack }) {
    // Evidence strength styling
    const evidenceStyle = {
      strong:   { background: '#f0fdf4', color: '#166534', border: '1px solid #86efac', label: 'Strong Evidence' },
      moderate: { background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a', label: 'Moderate Evidence' },
      weak:     { background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5', label: 'Weak Evidence' },
    }
  
    const ev = evidenceStyle[resolution.evidence_strength] || evidenceStyle.weak
  
    return (
      <div>
        {/* ── KB Articles Panel ─────────────────────────────── */}
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Knowledge Base Matches</h2>
  
        {kbResults.length === 0 ? (
          <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
            No relevant KB articles found. Resolution is based on general knowledge.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
            {kbResults.map(kb => (
              <div
                key={kb.article_id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: 16,
                  background: '#fff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{
                      display: 'inline-block',
                      background: '#e0e7ff',
                      color: '#3730a3',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      marginBottom: 6,
                    }}>
                      {kb.article_id}
                    </span>
                    <h3 style={{ margin: '4px 0', fontSize: 15 }}>{kb.title}</h3>
                  </div>
                  <span style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>
                    Score: {kb.score}
                  </span>
                </div>
                <p style={{ margin: '8px 0 6px', fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
                  {kb.snippet}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
                  {kb.match_reason}
                </p>
                {kb.resolution_time_minutes && (
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>
                    Typical resolution: ~{kb.resolution_time_minutes} min
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
  
        {/* ── Resolution Draft Panel ────────────────────────── */}
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Grounded Resolution Draft</h2>
  
        {/* Evidence strength badge */}
        <div style={{
          display: 'inline-block',
          padding: '6px 14px',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 600,
          background: ev.background,
          color: ev.color,
          border: ev.border,
          marginBottom: 16,
        }}>
          {ev.label}
        </div>
  
        {/* Root cause */}
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
        }}>
          <h4 style={{ margin: '0 0 6px', fontSize: 13, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>
            Likely Root Cause
          </h4>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{resolution.likely_root_cause}</p>
        </div>
  
        {/* Recommended next steps */}
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
        }}>
          <h4 style={{ margin: '0 0 10px', fontSize: 13, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>
            Recommended Next Steps
          </h4>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            {resolution.recommended_next_steps.map((step, i) => (
              <li key={i} style={{
                marginBottom: 8,
                fontSize: 14,
                lineHeight: 1.5,
                color: step.startsWith('[Inferred]') ? '#9a3412' : '#1a1a1a',
              }}>
                {step}
              </li>
            ))}
          </ol>
        </div>
  
        {/* User-facing update */}
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
        }}>
          <h4 style={{ margin: '0 0 6px', fontSize: 13, color: '#1e40af', textTransform: 'uppercase', letterSpacing: 1 }}>
            User-Facing Update (Customer Visible)
          </h4>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#1e3a8a' }}>
            {resolution.user_facing_update}
          </p>
        </div>
  
        {/* Internal work notes */}
        <div style={{
          background: '#fefce8',
          border: '1px solid #fde68a',
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
        }}>
          <h4 style={{ margin: '0 0 6px', fontSize: 13, color: '#854d0e', textTransform: 'uppercase', letterSpacing: 1 }}>
            Internal Work Notes
          </h4>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#78350f', whiteSpace: 'pre-wrap' }}>
            {resolution.internal_work_notes}
          </p>
        </div>
  
        {/* Source articles */}
        {resolution.source_article_ids?.length > 0 && (
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
            Sources cited:{' '}
            {resolution.source_article_ids.map((id, i) => (
              <span key={id}>
                <span style={{
                  background: '#e0e7ff',
                  color: '#3730a3',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 700,
                }}>
                  {id}
                </span>
                {i < resolution.source_article_ids.length - 1 ? ' ' : ''}
              </span>
            ))}
          </p>
        )}
  
        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button
            onClick={onBack}
            style={{
              padding: '10px 20px', fontSize: 14, cursor: 'pointer',
              background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6,
            }}
          >
            ← Back to Triage
          </button>
          <button
            onClick={onReset}
            style={{
              padding: '10px 20px', fontSize: 14, cursor: 'pointer',
              background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6,
            }}
          >
            New Incident
          </button>
          <button
            disabled
            title="Coming in Phase 3"
            style={{
              padding: '10px 20px', fontSize: 14,
              background: '#2563eb', color: 'white', border: 'none', borderRadius: 6,
              opacity: 0.5, cursor: 'not-allowed',
            }}
          >
            Approve & Create in ServiceNow →
          </button>
        </div>
      </div>
    )
  }