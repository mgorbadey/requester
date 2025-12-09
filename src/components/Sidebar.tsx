import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import Modal from './Modal'
import './Sidebar.css'

function Sidebar() {
  const { collections, addCollection } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [collectionName, setCollectionName] = useState('')

  const handleAddCollection = () => {
    setIsModalOpen(true)
  }

  const handleSubmitCollection = (e: React.FormEvent) => {
    e.preventDefault()
    if (collectionName.trim()) {
      addCollection(collectionName.trim())
      setCollectionName('')
      setIsModalOpen(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCollectionName('')
  }

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">Requester</h1>
          <button className="btn-add-collection" onClick={handleAddCollection}>
            + New Collection
          </button>
        </div>
        <nav className="sidebar-nav">
          <Link to="/" className="nav-item">
            <span>🏠</span> Home
          </Link>
          {collections.map((collection) => (
            <Link
              key={collection.id}
              to={`/collection/${collection.id}`}
              className="nav-item"
            >
              <span>📁</span> {collection.name}
            </Link>
          ))}
        </nav>
      </aside>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Create New Collection"
      >
        <form onSubmit={handleSubmitCollection}>
          <div className="modal-form-group">
            <label htmlFor="collection-name">Collection Name</label>
            <input
              id="collection-name"
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="Enter collection name"
              autoFocus
              className="modal-input"
            />
          </div>
          <div className="modal-form-actions">
            <button type="button" onClick={handleCloseModal} className="btn-modal-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-modal-submit" disabled={!collectionName.trim()}>
              Create
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default Sidebar

