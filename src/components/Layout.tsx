import { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Notification from './Notification'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <Sidebar />
      <main className="layout-main">{children}</main>
      <Notification />
    </div>
  )
}

export default Layout

