export default function TriageResults({ result, onReset }) {
    // Color mapping for priority badges
    const priorityStyle = {
      P1: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' },
      P2: { background: '#fff7ed', color: '#9a3412', border: '1px solid #fdba74' },
      P3: { background: '#fefce8', color: '#854d0e', border: '1px solid #fde047' },
      P4: { background: '#f0fdf4', color: '#166534', border: '1px solid #86efac' },
    }
  
    const levelStyle = {
      high:   { background: '#fee2e2', color: '#991b1b' },
      medium: { background: '#fff7ed', color: '#9a3412' },
      low:    { background: '#f0fdf4', color: '#166534' },
    }
  
    const badge = (text, styleMap) => (
      <span style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 600,
        ...(styleMap[text] || { background: '#f3f4f6', color: '#374151' }),
      }}>
        {text}
      </span>
    )
  
    return (
      <div>
        {/* Summary */}
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 20,
          marginBottom: 20,
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>
            Incident Summary
          </h3>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>
            {result.incident_summary}
          </p>
        </div>
  
        {/* Classification grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginBottom: 20,
        }}>
          <div>
            <h4 style={{ margin: '0 0 6px', fontSize: 13, color: '#6b7280' }}>Category</h4>
            <p style={{ margin: 0, fontWeight: 600 }}>{result.suggested_category}</p>
            <p style={{ margin: '2px 0 0', fontSize: 14, color: '#6b7280' }}>{result.suggested_subcategory}</p>
          </div>
  
          <div>
            <h4 style={{ margin: '0 0 6px', fontSize: 13, color: '#6b7280' }}>Priority</h4>
            {badge(result.suggested_priority, priorityStyle)}
          </div>
  
          <div>
            <h4 style={{ margin: '0 0 6px', fontSize: 13, color: '#6b7280' }}>Impact</h4>
            {badge(result.suggested_impact, levelStyle)}
          </div>
  
          <div>
            <h4 style={{ margin: '0 0 6px', fontSize: 13, color: '#6b7280' }}>Urgency</h4>
            {badge(result.suggested_urgency, levelStyle)}
          </div>
        </div>
  
        {/* Confidence note */}
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: 8,
          padding: 16,
          marginBottom: 20,
        }}>
          <h4 style={{ margin: '0 0 6px', fontSize: 13, color: '#92400e' }}>Confidence Note</h4>
          <p style={{ margin: 0, fontSize: 14, color: '#78350f' }}>
            {result.confidence_note}
          </p>
        </div>
  
        {/* Missing information questions */}
        {result.missing_information_questions?.length > 0 && (
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 8,
            padding: 16,
            marginBottom: 20,
          }}>
            <h4 style={{ margin: '0 0 10px', fontSize: 13, color: '#1e40af' }}>
              Missing Information — Questions for the Requester
            </h4>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              {result.missing_information_questions.map((q, i) => (
                <li key={i} style={{ marginBottom: 6, fontSize: 14, color: '#1e3a8a' }}>{q}</li>
              ))}
            </ol>
          </div>
        )}
  
        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button
            onClick={onReset}
            style={{
              padding: '10px 20px',
              fontSize: 14,
              cursor: 'pointer',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: 6,
            }}
          >
            ← New Incident
          </button>
          <button
            disabled
            title="Coming in Phase 2"
            style={{
              padding: '10px 20px',
              fontSize: 14,
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              opacity: 0.5,
              cursor: 'not-allowed',
            }}
          >
            Search Knowledge Base →
          </button>
        </div>
      </div>
    )
  }