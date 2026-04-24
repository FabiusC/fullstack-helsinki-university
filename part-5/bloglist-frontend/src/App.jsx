import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [notificationType, setNotificationType] = useState('success')

  const sortBlogsByLikes = (blogsToSort) =>
    [...blogsToSort].sort((a, b) => b.likes - a.likes)

  useEffect(() => {
    const fetchBlogs = async () => {
      const allBlogs = await blogService.getAll()
      setBlogs(sortBlogsByLikes(allBlogs))
    }

    fetchBlogs()
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser')

    if (loggedUserJSON) {
      const loggedUser = JSON.parse(loggedUserJSON)
      setUser(loggedUser)
      blogService.setToken(loggedUser.token)
    }
  }, [])

  const showNotification = (message, type = 'success') => {
    setNotificationMessage(message)
    setNotificationType(type)
    setTimeout(() => {
      setNotificationMessage(null)
    }, 5000)
  }

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const loggedUser = await loginService.login({ username, password })

      window.localStorage.setItem('loggedBlogAppUser', JSON.stringify(loggedUser))
      blogService.setToken(loggedUser.token)
      setUser(loggedUser)
      setUsername('')
      setPassword('')
      showNotification(`${loggedUser.name} logged in`, 'success')
    } catch {
      showNotification('wrong username or password', 'error')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogAppUser')
    blogService.setToken(null)
    setUser(null)
  }

  const addBlog = async (blogObject) => {
    try {
      const createdBlog = await blogService.create(blogObject)
      setBlogs(prevBlogs => sortBlogsByLikes(prevBlogs.concat(createdBlog)))
      showNotification(`a new blog ${createdBlog.title} by ${createdBlog.author} added`, 'success')
      return createdBlog
    } catch {
      showNotification('failed to add blog', 'error')
      return null
    }
  }

  const handleLike = async (blog) => {
    const userId = blog.user?.id || blog.user?._id || blog.user

    const updatedBlog = {
      user: userId,
      likes: blog.likes + 1,
      author: blog.author,
      title: blog.title,
      url: blog.url
    }

    try {
      const returnedBlog = await blogService.update(blog.id, updatedBlog)
      const blogWithUser = returnedBlog.user ? returnedBlog : { ...returnedBlog, user: blog.user }

      setBlogs(prevBlogs => sortBlogsByLikes(
        prevBlogs.map(currentBlog =>
          currentBlog.id === blog.id ? blogWithUser : currentBlog
        )
      ))
    } catch {
      showNotification('failed to like blog', 'error')
    }
  }

  const handleDelete = async (blog) => {
    const confirmDelete = window.confirm(`Remove blog ${blog.title} by ${blog.author}`)

    if (!confirmDelete) {
      return
    }

    try {
      await blogService.remove(blog.id)
      setBlogs(prevBlogs => prevBlogs.filter(currentBlog => currentBlog.id !== blog.id))
      showNotification(`removed ${blog.title}`, 'success')
    } catch {
      showNotification('failed to remove blog', 'error')
    }
  }

  if (user === null) {
    return (
      <div>
        <Notification message={notificationMessage} type={notificationType} />
        <h2>log in to application</h2>
        <form onSubmit={handleLogin}>
          <div>
            username
            <input
              type="text"
              value={username}
              name="Username"
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div>
            password
            <input
              type="password"
              value={password}
              name="Password"
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button type="submit">login</button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <Notification message={notificationMessage} type={notificationType} />
      <h2>blogs</h2>
      <p>
        {user.name} logged in
        <button onClick={handleLogout} type="button">logout</button>
      </p>
      <BlogForm createBlog={addBlog} />
      {blogs.map(blog => {
        const blogOwnerUsername = blog.user?.username
        const canRemove = user?.username === blogOwnerUsername

        return (
          <Blog
            key={blog.id}
            blog={blog}
            onLike={handleLike}
            onDelete={handleDelete}
            canRemove={canRemove}
          />
        )
      })}
    </div>
  )
}

export default App