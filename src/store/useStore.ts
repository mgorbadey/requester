import { create } from 'zustand'
import { Request, Collection, Response } from '../types'

export interface Notification {
  message: string
  type: 'success' | 'error'
}

interface AppState {
  collections: Collection[]
  currentRequest: Request | null
  response: Response | null
  loading: boolean
  error: string | null
  countdown: number | null
  notification: Notification | null
  
  // Collections
  addCollection: (name: string) => string
  deleteCollection: (id: string) => void
  updateCollection: (id: string, name: string) => void
  
  // Requests
  addRequest: (request: Omit<Request, 'id'>, collectionId?: string) => void
  updateRequest: (id: string, request: Partial<Request>) => void
  deleteRequest: (id: string) => void
  setCurrentRequest: (request: Request | null) => void
  
  // Response
  setResponse: (response: Response | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setCountdown: (countdown: number | null) => void
  setNotification: (notification: Notification | null) => void
}

export const useStore = create<AppState>((set) => ({
  collections: [],
  currentRequest: null,
  response: null,
  loading: false,
  error: null,
  countdown: null,
  notification: null,
  
  addCollection: (name) => {
    const newCollection = {
      id: Date.now().toString(),
      name,
      requests: [],
    }
    set((state) => ({
      collections: [...state.collections, newCollection],
    }))
    return newCollection.id
  },
  
  deleteCollection: (id) =>
    set((state) => ({
      collections: state.collections.filter((c) => c.id !== id),
    })),
  
  updateCollection: (id, name) =>
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === id ? { ...c, name } : c
      ),
    })),
  
  addRequest: (request, collectionId) => {
    const newRequest: Request = {
      ...request,
      id: Date.now().toString(),
      collectionId,
    }
    
    set((state) => {
      if (collectionId) {
        return {
          collections: state.collections.map((c) =>
            c.id === collectionId
              ? { ...c, requests: [...c.requests, newRequest] }
              : c
          ),
          currentRequest: newRequest,
        }
      }
      return { currentRequest: newRequest }
    })
  },
  
  updateRequest: (id, updates) =>
    set((state) => {
      const updatedRequest = { ...state.currentRequest, ...updates, id }
      return {
        currentRequest: updatedRequest as Request,
        collections: state.collections.map((c) => ({
          ...c,
          requests: c.requests.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),
      }
    }),
  
  deleteRequest: (id) =>
    set((state) => ({
      collections: state.collections.map((c) => ({
        ...c,
        requests: c.requests.filter((r) => r.id !== id),
      })),
      currentRequest: state.currentRequest?.id === id ? null : state.currentRequest,
    })),
  
  setCurrentRequest: (request) => set({ currentRequest: request }),
  
  setResponse: (response) => set({ response }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  setCountdown: (countdown) => set({ countdown }),
  
  setNotification: (notification) => set({ notification }),
}))

