import RequestBuilder from '../components/RequestBuilder'
import ResponseViewer from '../components/ResponseViewer'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <div className="home-request-panel">
        <RequestBuilder />
      </div>
      <div className="home-response-panel">
        <ResponseViewer />
      </div>
    </div>
  )
}

export default Home

