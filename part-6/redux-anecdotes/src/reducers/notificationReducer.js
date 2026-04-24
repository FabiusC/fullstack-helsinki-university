import { createSlice } from '@reduxjs/toolkit'

let timeoutId

const notificationSlice = createSlice({
    name: 'notification',
    initialState: 'anecdotes loaded',
    reducers: {
        notificationSet(state, action) {
            return action.payload
        },
        notificationClear() {
            return ''
        }
    }
})

export const { notificationSet, notificationClear } = notificationSlice.actions

export const setNotification = (message, seconds = 5) => {
    return dispatch => {
        dispatch(notificationSet(message))
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
            dispatch(notificationClear())
        }, seconds * 1000)
    }
}

export default notificationSlice.reducer
