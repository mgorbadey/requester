import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { Response as ApiResponse } from '../types'

export async function sendRequest(config: {
  method: string
  url: string
  headers?: Record<string, string>
  body?: string
}): Promise<ApiResponse> {
  const startTime = Date.now()

  const axiosConfig: AxiosRequestConfig = {
    method: config.method.toLowerCase() as any,
    url: config.url,
    headers: config.headers || {},
    data: config.body,
    validateStatus: () => true, // Don't throw on any status code
  }

  try {
    const axiosResponse: AxiosResponse = await axios(axiosConfig)
    const endTime = Date.now()

    // Check if response is HTML when it shouldn't be (likely CORS or wrong endpoint)
    const responseData = axiosResponse.data
    const contentType = axiosResponse.headers['content-type'] || ''
    const isHtmlResponse = typeof responseData === 'string' && 
      (responseData.trim().startsWith('<!doctype html') || 
       responseData.trim().startsWith('<!DOCTYPE html') || 
       responseData.trim().startsWith('<html') ||
       contentType.includes('text/html'))

    if (isHtmlResponse && !config.url.includes('localhost:3000') && !config.url.includes('127.0.0.1:3000')) {
      // This is likely a CORS error or the request hit the wrong server
      console.warn('Received HTML response - this might indicate a CORS error or incorrect endpoint')
    }

    return {
      status: axiosResponse.status,
      statusText: axiosResponse.statusText,
      headers: axiosResponse.headers as Record<string, string>,
      data: responseData,
      time: endTime - startTime,
    }
  } catch (error) {
    const endTime = Date.now()
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers as Record<string, string>,
          data: error.response.data,
          time: endTime - startTime,
        }
      }
      
      // Handle network errors - distinguish between connectivity issues and CORS
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
        console.error('Network Error. Request URL:', config.url)
        console.error('Error details:', error)
        
        // Check for specific network error codes that indicate actual connectivity issues
        const errorMessage = error.message || ''
        const errorString = JSON.stringify(error).toLowerCase()
        const isInternetDisconnected = errorMessage.includes('ERR_INTERNET_DISCONNECTED') || 
                                       errorMessage.includes('ERR_NAME_NOT_RESOLVED') ||
                                       errorMessage.includes('ERR_CONNECTION_REFUSED') ||
                                       errorMessage.includes('ERR_CONNECTION_TIMED_OUT') ||
                                       errorString.includes('err_internet_disconnected') ||
                                       errorString.includes('err_name_not_resolved') ||
                                       errorString.includes('err_connection_refused')
        
        // IMPORTANT: If the URL works in browser but fails in fetch/AJAX, it's almost certainly CORS
        // Browsers often report CORS errors as generic network errors (ERR_NETWORK)
        // The key indicator: no response object + HTTP URL + network error = likely CORS
        const isLikelyCors = !error.response && 
          config.url.startsWith('http') &&
          !isInternetDisconnected &&
          (error.message.includes('CORS') || 
           error.code === 'ERR_CORS' ||
           // If it's a network error with no response, and URL is accessible, it's CORS
           (error.code === 'ERR_NETWORK' && !isInternetDisconnected))
        
        if (isInternetDisconnected) {
          throw new Error(`Connection Error: Cannot reach the server at ${config.url}. Possible causes: 1) Server is not running or not accessible, 2) Firewall blocking the connection, 3) Wrong IP address or port, 4) Network connectivity issue. Check if the server is running and accessible.`)
        }
        
        if (isLikelyCors) {
          throw new Error(`CORS Error: The API server at ${config.url} is blocking requests from ${window.location.origin}. The URL works in your browser, but AJAX/fetch requests are blocked due to missing CORS headers. The server needs to include: Access-Control-Allow-Origin: * (or ${window.location.origin}).`)
        }
        
        // Generic network error - but note it might be CORS if URL works in browser
        const errorMsg = error.message || 'Network error'
        throw new Error(`Network Error: ${errorMsg}. URL attempted: ${config.url}. Note: If this URL works when you open it directly in your browser, it's likely a CORS issue. The server needs CORS headers. Otherwise, check: 1) Server accessibility, 2) Firewall, 3) Network connectivity.`)
      }
      
      throw new Error(error.message || 'Network error')
    }
    
    throw new Error('Unknown error occurred')
  }
}

