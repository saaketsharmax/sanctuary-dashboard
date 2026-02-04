import Link from 'next/link'

export default function MarketingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      background: 'linear-gradient(to bottom, #fafafa, #f0f0f0)'
    }}>
      <div style={{
        width: 80,
        height: 80,
        borderRadius: 16,
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24
      }}>
        <span style={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}>S</span>
      </div>
      <h1 style={{ fontSize: 48, fontWeight: 'bold', marginBottom: 16 }}>
        Sanctuary
      </h1>
      <p style={{ fontSize: 20, color: '#666', marginBottom: 32, textAlign: 'center', maxWidth: 500 }}>
        AI-Powered Startup Accelerator
      </p>
      <div style={{ display: 'flex', gap: 16 }}>
        <Link
          href="https://sanctuary-dashboard.vercel.app"
          style={{
            padding: '12px 24px',
            background: '#000',
            color: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 500
          }}
        >
          Go to Dashboard
        </Link>
      </div>
      <p style={{ marginTop: 48, fontSize: 14, color: '#999' }}>
        Marketing site coming soon
      </p>
    </div>
  )
}
