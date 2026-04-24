import { createSlice } from '@reduxjs/toolkit'
import { setNotification } from './notificationReducer'

const baseUrl = 'http://localhost:3001/anecdotes'

const anecdoteSlice = createSlice({
    name: 'anecdotes',
    initialState: [],
    reducers: {
        setAnecdotes(state, action) {
            return action.payload
        },
        appendAnecdote(state, action) {
            state.push(action.payload)
        },
        replaceAnecdote(state, action) {
            return state.map(anecdote =>
                anecdote.id === action.payload.id ? action.payload : anecdote
            )
        }
    }
})

export const { setAnecdotes, appendAnecdote, replaceAnecdote } = anecdoteSlice.actions

export const initializeAnecdotes = () => {
    return async dispatch => {
        const response = await fetch(baseUrl)
        const anecdotes = await response.json()
        dispatch(setAnecdotes(anecdotes))
    }
}

export const createAnecdote = content => {
    return async dispatch => {
        const anecdote = {
            content,
            votes: 0
        }

        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(anecdote)
        })

        const createdAnecdote = await response.json()
        dispatch(appendAnecdote(createdAnecdote))
        dispatch(setNotification(`you created '${createdAnecdote.content}'`, 5))
    }
}

export const voteAnecdote = anecdote => {
    return async dispatch => {
        const updatedAnecdote = {
            ...anecdote,
            votes: anecdote.votes + 1
        }

        const response = await fetch(`${baseUrl}/${anecdote.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedAnecdote)
        })

        const returnedAnecdote = await response.json()
        dispatch(replaceAnecdote(returnedAnecdote))
        dispatch(setNotification(`you voted '${returnedAnecdote.content}'`, 5))
    }
}

export default anecdoteSlice.reducer
