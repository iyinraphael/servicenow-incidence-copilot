/**
 * SuccessScreen — shows what was written to ServiceNow.
 *
 * Props:
 *   result — the response from createIncident() or updateIncident()
 *   isUpdate — whether this was an update (vs new creation)
 *   snowInstance — the ServiceNow instance URL (for deep link)
 *   onNewIncident() — reset everything for a new incident
 */
export default function SuccessScreen({ result, isUpdate, snowInstance, onNewIncident }) {
    const timestamp = result.created || result.updated || new Date().toISOString()
  
    return (
      <div>
        {/* Success banner */}
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: 8,
          padding: 24,
          textAlign: 'center',
          marginBottom: 28,
        }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>✓</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 22, color: '#166534' }}>
            Incident {isUpdate ? 'Updated' : 'Created'} Successfully
          </h2>
          <p style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
            color: '#15803d',
            fontFamily: 'monospace',
            letterSpacing: 1,
          }}>
            {result.number}
          </p>
        </div>
  
        {/* Details */}
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 20,
          marginBottom: 20,
          background: '#fff',
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#374151' }}>
            What was written to ServiceNow
          </h3>
  
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <tbody>
              {Object.entries(result.fieldsWritten).map(([key, value]) => (
                <tr key={key} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{
                    padding: '8px 12px',
                    fontWeight: 600,
                    color: '#6b7280',
                    verticalAlign: 'top',
                    width: '35%',
                    fontFamily: 'monospace',
                    fontSize: 12,
                  }}>
                    {key}
                  </td>
                  <td style={{
                    padding: '8px 12px',
                    color: '#1f2937',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.5,
                  }}>
                    {value || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  
        {/* Metadata */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 24,
          fontSize: 13,
          color: '#6b7280',
        }}>
          <div>
            <strong>Sys ID:</strong> <code style={{ fontSize: 11 }}>{result.sys_id}</code>
          </div>
          <div>
            <strong>Timestamp:</strong> {timestamp}
          </div>
        </div>
  
        {/* Link to ServiceNow */}
        {snowInstance && (
          <p style={{ fontSize: 13, marginBottom: 20 }}>
            <a
              href={`${snowInstance}/nav_to.do?uri=incident.do?sysparm_query=number=${result.number}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#2563eb' }}
            >
              Open {result.number} in ServiceNow →
            </a>
          </p>
        )}
  
        {/* Actions */}
        <button
          onClick={onNewIncident}
          style={{
            padding: '12px 24px', fontSize: 15, fontWeight: 600,
            cursor: 'pointer',
            background: '#2563eb', color: 'white',
            border: 'none', borderRadius: 6,
          }}
        >
          Triage Another Incident
        </button>
      </div>
    )
  }