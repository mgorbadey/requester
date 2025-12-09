import { useStore } from '../store/useStore'
import './ResponseViewer.css'

function ResponseViewer() {
  const { response, loading, error, countdown } = useStore()

  if (loading) {
    return (
      <div className="response-viewer">
        <div className="response-loading">
          {countdown !== null && countdown > 0 ? (
            <div className="countdown-display">
              <div className="countdown-spinner"></div>
              <div className="countdown-text">Waiting for response... {countdown}s</div>
            </div>
          ) : (
            'Loading...'
          )}
        </div>
      </div>
    )
  }

  if (error) {
    const isCorsError = error.toLowerCase().includes('cors')
    const isConnectionError = error.toLowerCase().includes('connection error') || 
                             error.toLowerCase().includes('cannot reach') ||
                             error.toLowerCase().includes('not accessible')
    
    return (
      <div className="response-viewer">
        <div className="response-error">
          <h3>Error</h3>
          <p>{error}</p>
          {isConnectionError && (
            <div className="cors-help">
              <p><strong>Troubleshooting Connection Issues:</strong></p>
              <ul>
                <li><strong>Verify the server is running:</strong> Check if the API server at the IP address is actually running</li>
                <li><strong>Check the IP and port:</strong> Make sure the IP address (18.231.212.124) and port (3000) are correct</li>
                <li><strong>Test connectivity:</strong> Try accessing <code>http://18.231.212.124:3000/country</code> directly in your browser</li>
                <li><strong>Check firewall:</strong> The server might be behind a firewall that blocks external connections</li>
                <li><strong>Network access:</strong> Make sure your network can reach the server's IP address</li>
                <li><strong>Server logs:</strong> Check the server logs to see if the request is reaching it</li>
              </ul>
            </div>
          )}
          {isCorsError && (
            <div className="cors-help">
              <p><strong>⚠️ CORS Error Detected</strong></p>
              <p>If the URL works when you open it directly in your browser, this confirms it's a CORS issue. The server is reachable, but it's not allowing AJAX/fetch requests from this origin.</p>
              <p><strong>How to fix CORS errors:</strong></p>
              <ul>
                <li><strong>For Express.js/Node.js:</strong>
                  <pre>npm install cors</pre>
                  Then add:
                  <pre>{`const cors = require('cors'); app.use(cors());`}</pre>
                  Or for specific origin:
                  <pre>{`app.use(cors({ origin: 'http://localhost:3000' }));`}</pre>
                </li>
                <li><strong>For other servers:</strong> Add these HTTP headers to all responses:
                  <pre>{'Access-Control-Allow-Origin: *'}</pre>
                  <pre>{'Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS'}</pre>
                  <pre>{'Access-Control-Allow-Headers: Content-Type'}</pre>
                  <pre>{'Access-Control-Max-Age: 86400'}</pre>
                </li>
                <li><strong>For OPTIONS preflight:</strong> Make sure your server handles OPTIONS requests and returns the CORS headers</li>
                <li><strong>Test:</strong> After adding CORS, the request should work. Check server logs to confirm the request is reaching the server.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="response-viewer">
        <div className="response-empty">No response yet. Send a request to see the response.</div>
      </div>
    )
  }

  const statusClass =
    response.status >= 200 && response.status < 300
      ? 'status-success'
      : response.status >= 400
      ? 'status-error'
      : 'status-info'

  return (
    <div className="response-viewer">
      <div className="response-header">
        <div className={`response-status ${statusClass}`}>
          {response.status} {response.statusText}
        </div>
        <div className="response-time">Time: {response.time}ms</div>
      </div>

      <div className="response-section">
        <h3>Headers</h3>
        <pre className="response-content">
          {JSON.stringify(response.headers, null, 2)}
        </pre>
      </div>

      <div className="response-section">
        <h3>Body</h3>
        <pre className="response-content">
          {(() => {
            const data = response.data
            if (typeof data === 'string') {
              // Check if it's HTML (likely a CORS error or dev server response)
              if (data.trim().startsWith('<!doctype html') || data.trim().startsWith('<!DOCTYPE html') || data.trim().startsWith('<html')) {
                return `⚠️ HTML Response Detected (likely a CORS error or incorrect URL)\n\n${data}`
              }
              return data
            }
            return JSON.stringify(data, null, 2)
          })()}
        </pre>
      </div>
    </div>
  )
}

export default ResponseViewer

