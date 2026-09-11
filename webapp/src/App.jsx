import { useState } from 'react';

function App() {
  const [loading, setLoading] = useState(false);
  const [sarifReport, setSarifReport] = useState(null);
  const [error, setError] = useState(null);

  const runScan = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, ensure CORS is handled and URL is correct
      const response = await fetch('http://localhost:8000/api/scan');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSarifReport(data);
    } catch (e) {
      setError(e.message);
      console.error("Scan failed:", e);
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract results from SARIF
  const getResults = () => {
    if (!sarifReport || !sarifReport.runs || sarifReport.runs.length === 0) return [];
    const run = sarifReport.runs[0];
    const rules = run.tool?.driver?.rules || [];
    const results = run.results || [];
    
    // Map rule definitions to results for easier rendering
    return results.map(result => {
      const ruleDef = rules.find(r => r.id === result.ruleId);
      return {
        ...result,
        ruleDefinition: ruleDef
      };
    });
  };

  const results = getResults();

  return (
    <div className="app-container">
      <header className="header">
        <div>
          <h1>Acme Health Security</h1>
          <p>Compliance-as-Code Scanner & SARIF Viewer</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={runScan}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loader"></span> Scanning...
            </>
          ) : (
            'Run Compliance Scan'
          )}
        </button>
      </header>

      <main>
        {error && (
          <div className="surface" style={{ borderColor: 'var(--status-error)', marginBottom: '24px' }}>
            <h3 style={{ color: 'var(--status-error)' }}>Error Running Scan</h3>
            <p>{error}</p>
          </div>
        )}

        {!sarifReport && !loading && !error && (
          <div className="surface empty-state">
            <div className="empty-icon">🛡️</div>
            <h2>Ready to Scan</h2>
            <p>Click the button above to run the compliance checks against the Acme Health infrastructure. Results will be displayed here.</p>
          </div>
        )}

        {sarifReport && (
          <div className="surface" style={{ marginBottom: '24px' }}>
            <h2>Scanner Information</h2>
            <p><strong>Tool:</strong> {sarifReport.runs?.[0]?.tool?.driver?.name}</p>
            <p><strong>SARIF Version:</strong> {sarifReport.version}</p>
            <p><strong>Issues Found:</strong> {results.length}</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="results-grid">
            {results.map((result, idx) => (
              <div key={idx} className="surface rule-card">
                <div className="rule-header">
                  <span className="rule-title">{result.ruleDefinition?.name || result.ruleId}</span>
                  <span className={`badge badge-${result.level === 'error' ? 'error' : 'warn'}`}>
                    {result.level}
                  </span>
                </div>
                
                <p className="rule-message">{result.message?.text}</p>
                
                {result.ruleDefinition?.fullDescription && (
                  <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                    {result.ruleDefinition.fullDescription.text}
                  </p>
                )}

                {result.locations?.map((loc, lidx) => (
                  <div key={lidx} className="rule-uri">
                    {loc.physicalLocation?.artifactLocation?.uri}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
