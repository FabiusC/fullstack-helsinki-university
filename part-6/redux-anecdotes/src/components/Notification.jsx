import { useNotificationValue } from '../context/NotificationContext'

const Notification = () => {
  const message = useNotificationValue()
  const style = {
    border: 'solid',
    padding: 10,
    borderWidth: 1,
    marginBottom: 10
  }

  if (!message) {
    return null
  }

  return <div style={style}>{message}</div>
}

export default Notification
