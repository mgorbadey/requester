import { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'

// BrowserRouter wrapper for tests
// React Router v7 has v7_startTransition and v7_relativeSplatPath enabled by default
export function TestRouter({ children }: { children: ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>
}

