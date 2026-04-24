const baseUrl = 'http://localhost:3001/anecdotes'

export const getAnecdotes = async () => {
    const response = await fetch(baseUrl)

    if (!response.ok) {
        throw new Error('Failed to fetch anecdotes')
    }

    return response.json()
}

export const createAnecdote = async content => {
    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, votes: 0 })
    })

    if (!response.ok) {
        const errorMessage = await response.text()
        throw new Error(errorMessage || 'Failed to create anecdote')
    }

    return response.json()
}

export const voteAnecdote = async anecdote => {
    const response = await fetch(`${baseUrl}/${anecdote.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...anecdote,
            votes: anecdote.votes + 1
        })
    })

    if (!response.ok) {
        throw new Error('Failed to update anecdote')
    }

    return response.json()
}