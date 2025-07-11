export default function DebugPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Debug Page</h1>
      <p>Time: {new Date().toISOString()}</p>
      <p>Environment: {process.env.NODE_ENV}</p>
      <p>Database URL exists: {process.env.DATABASE_URL ? 'Yes' : 'No'}</p>
    </div>
  );
} 