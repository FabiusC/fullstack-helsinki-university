const baseNotificationStyle = {
    background: 'lightgrey',
    fontSize: 20,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10
}

const Notification = ({ message, type = 'success' }) => {
    if (message === null) {
        return null
    }

    const notificationStyle = {
        ...baseNotificationStyle,
        color: type === 'error' ? 'red' : 'green'
    }

    return (
        <div style={notificationStyle}>
            {message}
        </div>
    )
}

export default Notification