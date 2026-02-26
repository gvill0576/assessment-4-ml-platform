import { useState, useEffect } from 'react'
import axios from 'axios'

const SERVICES = [
  {
    name: 'Fraud Detection',
    team: 'Fraud Team',
    url: 'http://k8s-teamfrau-fraudser-20052c2cb1-76ca494304cad484.elb.us-east-1.amazonaws.com'
  },
  {
    name: 'Recommendations',
    team: 'Recommendations Team',
    url: 'http://k8s-teamreco-recommen-1b9a9c1448-2be20d0db2777fa4.elb.us-east-1.amazonaws.com'
  },
  {
    name: 'Forecasting',
    team: 'Forecasting Team',
    url: 'http://k8s-teamfore-forecast-37820e53e0-e52d05323fc44667.elb.us-east-1.amazonaws.com'
  },
]

function App() {
  const [statuses, setStatuses] = useState({})
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    const fetchAll = () => {
      SERVICES.forEach(svc => {
        axios.get(`${svc.url}/health`)
          .then(res => setStatuses(prev => ({ ...prev, [svc.name]: res.data })))
          .catch(() => setStatuses(prev => ({ ...prev, [svc.name]: { status: 'unreachable' } })))
      })
      setLastUpdated(new Date().toLocaleTimeString())
    }
    fetchAll()
    const interval = setInterval(fetchAll, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>ML Platform Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Internal Operations View — Auto-refreshes every 30 seconds
        {lastUpdated && ` — Last updated: ${lastUpdated}`}
      </p>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid #ccc' }}>Service</th>
            <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid #ccc' }}>Team</th>
            <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid #ccc' }}>Status</th>
            <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid #ccc' }}>Endpoint</th>
          </tr>
        </thead>
        <tbody>
          {SERVICES.map(svc => {
            const data = statuses[svc.name] || {}
            const healthy = data.status === 'healthy'
            const checking = !data.status
            return (
              <tr key={svc.name} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{svc.name}</td>
                <td style={{ padding: '0.75rem', color: '#555' }}>{svc.team}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    backgroundColor: checking ? '#eee' : healthy ? '#d4edda' : '#f8d7da',
                    color: checking ? '#666' : healthy ? '#155724' : '#721c24',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                  }}>
                    {data.status || 'checking...'}
                  </span>
                </td>
                <td style={{ padding: '0.75rem', color: '#555', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  {data.endpoint || '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default App
