import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import AnecdoteForm from './components/AnecdoteForm'
import AnecdoteList from './components/AnecdoteList'
import Filter from './components/Filter'
import Notification from './components/Notification'
import {
  NotificationProvider,
  useNotificationDispatch
} from './context/NotificationContext'
import { createAnecdote, getAnecdotes, voteAnecdote } from './services/anecdotes'

const App = () => {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  )
}

const AppContent = () => {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('')
  const dispatchNotification = useNotificationDispatch()

  const anecdotesQuery = useQuery({
    queryKey: ['anecdotes'],
    queryFn: getAnecdotes,
    retry: false
  })

  const showNotification = message => {
    dispatchNotification({ type: 'show', payload: message })
  }

  const createAnecdoteMutation = useMutation({
    mutationFn: createAnecdote,
    onSuccess: newAnecdote => {
      queryClient.setQueryData(['anecdotes'], oldAnecdotes =>
        oldAnecdotes ? [...oldAnecdotes, newAnecdote] : [newAnecdote]
      )
      showNotification(`you created '${newAnecdote.content}'`)
    },
    onError: error => {
      showNotification(error.message)
    }
  })

  const voteAnecdoteMutation = useMutation({
    mutationFn: voteAnecdote,
    onSuccess: updatedAnecdote => {
      queryClient.setQueryData(['anecdotes'], oldAnecdotes =>
        oldAnecdotes
          ? oldAnecdotes.map(anecdote =>
            anecdote.id === updatedAnecdote.id ? updatedAnecdote : anecdote
          )
          : []
      )
      showNotification(`you voted '${updatedAnecdote.content}'`)
    }
  })

  if (anecdotesQuery.isLoading) {
    return <div>loading data...</div>
  }

  if (anecdotesQuery.isError) {
    return (
      <div>
        <h2>Anecdotes</h2>
        <p>anecdote service not available due to problems in server</p>
      </div>
    )
  }

  const filteredAnecdotes = anecdotesQuery.data
    .filter(anecdote =>
      anecdote.content.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => b.votes - a.votes)

  const handleCreate = content => {
    createAnecdoteMutation.mutate(content)
  }

  const handleVote = anecdote => {
    voteAnecdoteMutation.mutate(anecdote)
  }

  return (
    <div>
      <h2>Anecdotes</h2>
      <Notification />
      <Filter value={filter} onChange={event => setFilter(event.target.value)} />
      <AnecdoteList anecdotes={filteredAnecdotes} onVote={handleVote} />
      <AnecdoteForm onCreate={handleCreate} />
    </div>
  )
}

export default App
