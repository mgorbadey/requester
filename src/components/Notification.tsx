import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import './Notification.css'

function Notification() {
  const { notification, setNotification } = useStore()

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [notification, setNotification])

  if (!notification) return null

  const notificationClass = `notification notification-${notification.type}`

  return (
    <div className={notificationClass}>
      {notification.message}
    </div>
  )
}

export default Notification
