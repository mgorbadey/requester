import { useParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import RequestBuilder from '../components/RequestBuilder'
import ResponseViewer from '../components/ResponseViewer'
import './Collection.css'

function Collection() {
  const { id } = useParams<{ id: string }>()
  const { collections, setCurrentRequest, deleteRequest, setNotification, setResponse, setError, setLoading, setCountdown } = useStore()
  
  const collection = collections.find((c) => c.id === id)

  if (!collection) {
    return (
      <div className="collection-not-found">
        <h2>Collection not found</h2>
      </div>
    )
  }

  return (
    <div className="collection">
      <div className="collection-sidebar">
        <h2 className="collection-title">{collection.name}</h2>
        <div className="collection-requests">
          {collection.requests.length === 0 ? (
            <div className="no-requests">No requests in this collection</div>
          ) : (
            collection.requests.map((request) => (
              <div
                key={request.id}
                className="request-item"
                onClick={() => {
                  setCurrentRequest(request)
                  setResponse(null)
                  setError(null)
                  setLoading(false)
                  setCountdown(null)
                }}
              >
                <span className="request-method">{request.method}</span>
                <span className="request-name">{request.name}</span>
                <button
                  className="btn-delete-request"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteRequest(request.id)
                    setNotification({ message: `Request "${request.name}" deleted successfully`, type: 'error' })
                  }}
                  aria-label="Delete request"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="collection-main">
        <div className="collection-request-panel">
          <RequestBuilder />
        </div>
        <div className="collection-response-panel">
          <ResponseViewer />
        </div>
      </div>
    </div>
  )
}

export default Collection

