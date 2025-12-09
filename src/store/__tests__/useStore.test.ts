import { useStore } from '../useStore'

describe('useStore', () => {
  beforeEach(() => {
    // Reset store state
    useStore.setState({
      collections: [],
      currentRequest: null,
      response: null,
      loading: false,
      error: null,
      countdown: null,
    })
  })

  it('adds a collection', () => {
    const { addCollection } = useStore.getState()
    
    addCollection('Test Collection')

    const { collections } = useStore.getState()
    expect(collections).toHaveLength(1)
    expect(collections[0].name).toBe('Test Collection')
  })

  it('deletes a collection', () => {
    // Reset state first
    useStore.setState({
      collections: [],
      currentRequest: null,
      response: null,
      loading: false,
      error: null,
      countdown: null,
    })
    
    const { addCollection, deleteCollection } = useStore.getState()
    
    addCollection('Collection 1')
    // Add small delay to ensure different IDs
    return new Promise(resolve => setTimeout(resolve, 10))
      .then(() => {
        addCollection('Collection 2')
        
        const { collections } = useStore.getState()
        expect(collections).toHaveLength(2)
        const firstCollectionId = collections[0].id
        const secondCollectionName = collections[1].name
        
        deleteCollection(firstCollectionId)

        const { collections: updatedCollections } = useStore.getState()
        expect(updatedCollections).toHaveLength(1)
        expect(updatedCollections[0].name).toBe(secondCollectionName)
      })
  })

  it('updates a collection', () => {
    const { addCollection, updateCollection } = useStore.getState()
    
    addCollection('Old Name')
    const { collections } = useStore.getState()
    const collectionId = collections[0].id
    
    updateCollection(collectionId, 'New Name')

    const { collections: updatedCollections } = useStore.getState()
    expect(updatedCollections[0].name).toBe('New Name')
  })

  it('adds a request to a collection', () => {
    const { addCollection, addRequest } = useStore.getState()
    
    addCollection('Test Collection')
    const { collections } = useStore.getState()
    const collectionId = collections[0].id
    
    addRequest(
      {
        name: 'Test Request',
        method: 'GET',
        url: 'https://api.example.com',
        headers: [],
      },
      collectionId
    )

    const { collections: updatedCollections } = useStore.getState()
    expect(updatedCollections[0].requests).toHaveLength(1)
    expect(updatedCollections[0].requests[0].name).toBe('Test Request')
  })

  it('sets current request', () => {
    const { setCurrentRequest } = useStore.getState()
    
    const request = {
      id: '1',
      name: 'Test Request',
      method: 'GET' as const,
      url: 'https://api.example.com',
      headers: [],
    }
    
    setCurrentRequest(request)

    const { currentRequest } = useStore.getState()
    expect(currentRequest).toEqual(request)
  })

  it('sets response', () => {
    const { setResponse } = useStore.getState()
    
    const response = {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: { message: 'Success' },
      time: 100,
    }
    
    setResponse(response)

    const { response: stateResponse } = useStore.getState()
    expect(stateResponse).toEqual(response)
  })
})

