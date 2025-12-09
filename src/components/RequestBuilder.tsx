import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { HttpMethod, Header, Request, Response as ApiResponse } from '../types'
import { sendRequest } from '../services/api'
import './RequestBuilder.css'

function RequestBuilder() {
  const { currentRequest, setCurrentRequest, setResponse, setLoading, setError, loading, updateRequest, addRequest, countdown, setCountdown } = useStore()
  
  const [method, setMethod] = useState<HttpMethod>('GET')
  const [url, setUrl] = useState('')
  const [headers, setHeaders] = useState<Header[]>([{ key: '', value: '', enabled: true }])
  const [body, setBody] = useState('')
  const [requestName, setRequestName] = useState('')
  const [delaySeconds, setDelaySeconds] = useState<number>(0)
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const responseRef = useRef<ApiResponse | null>(null)

  useEffect(() => {
    if (currentRequest) {
      setMethod(currentRequest.method)
      setUrl(currentRequest.url)
      setHeaders(currentRequest.headers.length > 0 ? currentRequest.headers : [{ key: '', value: '', enabled: true }])
      setBody(currentRequest.body || '')
      setRequestName(currentRequest.name)
    }
  }, [currentRequest])

  // Cleanup countdown interval on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
  }, [])

  // Handle countdown timer
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        const currentCountdown = useStore.getState().countdown
        if (currentCountdown === null || currentCountdown <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current)
            countdownIntervalRef.current = null
          }
          // Show response when countdown reaches 0
          if (responseRef.current) {
            setResponse(responseRef.current)
            responseRef.current = null
          }
          setLoading(false)
          setCountdown(null)
        } else {
          setCountdown(currentCountdown - 1)
        }
      }, 1000)
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
        countdownIntervalRef.current = null
      }
    }
  }, [countdown, setResponse, setLoading, setCountdown])

  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '', enabled: true }])
  }

  const handleHeaderChange = (index: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    const newHeaders = [...headers]
    newHeaders[index] = { ...newHeaders[index], [field]: value }
    setHeaders(newHeaders)
  }

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  const handleSend = async () => {
    if (!url.trim()) {
      setError('URL is required')
      return
    }

    // Validate and normalize URL format
    let requestUrl = url.trim()
    
    // Check if it's a relative URL (starts with / but not //)
    if (requestUrl.startsWith('/') && !requestUrl.startsWith('//')) {
      setError('Relative URLs are not supported. Please use a full URL (e.g., http://api.example.com/endpoint)')
      return
    }

    // If URL doesn't start with http:// or https://, add http:// (default to http for local/private IPs)
    if (!requestUrl.match(/^https?:\/\//i)) {
      // Check if it's an IP address or localhost - use http://
      if (requestUrl.match(/^(\d{1,3}\.){3}\d{1,3}/) || requestUrl.startsWith('localhost')) {
        requestUrl = `http://${requestUrl}`
      } else {
        // For domain names, default to https://
        requestUrl = `https://${requestUrl}`
      }
    }

    // Clear any existing countdown
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }

    setLoading(true)
    setError(null)
    setResponse(null)
    setCountdown(null)
    responseRef.current = null

    const activeHeaders = headers
      .filter((h) => h.enabled && h.key.trim())
      .reduce((acc, h) => {
        acc[h.key] = h.value
        return acc
      }, {} as Record<string, string>)

    try {
      // Log the actual URL being used for debugging
      console.log('Making request to:', requestUrl)
      
      // Send request immediately
      const response = await sendRequest({
        method,
        url: requestUrl,
        headers: activeHeaders,
        body: body.trim() || undefined,
      })

      // Store response temporarily
      responseRef.current = response

      // If delay is set, start countdown
      if (delaySeconds > 0) {
        setCountdown(delaySeconds)
      } else {
        // No delay, show response immediately
        setResponse(response)
        setLoading(false)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Request failed')
      setLoading(false)
      setCountdown(null)
      responseRef.current = null
    }
  }

  const handleSave = () => {
    if (!requestName.trim()) {
      alert('Please enter a request name')
      return
    }

    if (!url.trim()) {
      alert('Please enter a URL')
      return
    }

    // Normalize URL the same way as handleSend
    let requestUrl = url.trim()
    if (!requestUrl.startsWith('/') && !requestUrl.startsWith('//')) {
      if (!requestUrl.match(/^https?:\/\//i)) {
        if (requestUrl.match(/^(\d{1,3}\.){3}\d{1,3}/) || requestUrl.startsWith('localhost')) {
          requestUrl = `http://${requestUrl}`
        } else {
          requestUrl = `https://${requestUrl}`
        }
      }
    } else if (requestUrl.startsWith('/') && !requestUrl.startsWith('//')) {
      alert('Relative URLs are not supported. Please use a full URL (e.g., http://api.example.com/endpoint)')
      return
    }

    const request = {
      name: requestName,
      method,
      url: requestUrl,
      headers: headers.filter((h) => h.key.trim() || h.value.trim()),
      body: body.trim() || undefined,
    }

    if (currentRequest) {
      updateRequest(currentRequest.id, request)
      alert('Request updated successfully!')
    } else {
      const newRequest: Request = {
        ...request,
        id: Date.now().toString(),
      }
      addRequest(request)
      setCurrentRequest(newRequest)
      alert('Request saved successfully!')
    }
  }

  return (
    <div className="request-builder">
      <div className="request-header">
        <input
          type="text"
          placeholder="Request Name"
          value={requestName}
          onChange={(e) => setRequestName(e.target.value)}
          className="request-name-input"
        />
        <div className="request-actions">
          <div className="delay-input-container">
            <label htmlFor="delay-input" className="delay-label">Delay (s):</label>
            <input
              id="delay-input"
              type="number"
              min="0"
              step="1"
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(Math.max(0, parseInt(e.target.value) || 0))}
              className="delay-input"
              disabled={loading}
            />
          </div>
          <button onClick={handleSave} className="btn-save">
            Save
          </button>
          <button onClick={handleSend} className="btn-send" disabled={!url.trim() || loading}>
            {loading ? (countdown !== null ? `Waiting... ${countdown}s` : 'Sending...') : 'Send'}
          </button>
        </div>
      </div>

      <div className="request-method-url">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as HttpMethod)}
          className="method-select"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
          <option value="HEAD">HEAD</option>
          <option value="OPTIONS">OPTIONS</option>
        </select>
        <input
          type="text"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="url-input"
        />
      </div>

      <div className="request-section">
        <h3>Headers</h3>
        <div className="headers-list">
          {headers.map((header, index) => (
            <div key={index} className="header-row">
              <input
                type="checkbox"
                checked={header.enabled}
                onChange={(e) => handleHeaderChange(index, 'enabled', e.target.checked)}
                className="header-checkbox"
              />
              <input
                type="text"
                placeholder="Key"
                value={header.key}
                onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                className="header-key"
              />
              <input
                type="text"
                placeholder="Value"
                value={header.value}
                onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                className="header-value"
              />
              <button
                onClick={() => handleRemoveHeader(index)}
                className="btn-remove-header"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button onClick={handleAddHeader} className="btn-add-header">
          + Add Header
        </button>
      </div>

      {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
        <div className="request-section">
          <h3>Body</h3>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Request body (JSON, etc.)"
            className="body-textarea"
            rows={10}
          />
        </div>
      )}
    </div>
  )
}

export default RequestBuilder

