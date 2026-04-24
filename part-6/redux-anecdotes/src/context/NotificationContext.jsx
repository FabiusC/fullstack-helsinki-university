/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useReducer } from 'react'

const NotificationStateContext = createContext('')
const NotificationDispatchContext = createContext(null)

const notificationReducer = (state, action) => {
    switch (action.type) {
        case 'show':
            return action.payload
        case 'clear':
            return ''
        default:
            return state
    }
}

export const NotificationProvider = ({ children }) => {
    const [notification, dispatch] = useReducer(notificationReducer, '')

    useEffect(() => {
        if (!notification) {
            return undefined
        }

        const timeoutId = setTimeout(() => {
            dispatch({ type: 'clear' })
        }, 5000)

        return () => clearTimeout(timeoutId)
    }, [notification])

    return (
        <NotificationStateContext.Provider value={notification}>
            <NotificationDispatchContext.Provider value={dispatch}>
                {children}
            </NotificationDispatchContext.Provider>
        </NotificationStateContext.Provider>
    )
}

export const useNotificationValue = () => useContext(NotificationStateContext)

export const useNotificationDispatch = () => {
    const dispatch = useContext(NotificationDispatchContext)

    if (!dispatch) {
        throw new Error('useNotificationDispatch must be used within NotificationProvider')
    }

    return dispatch
}
