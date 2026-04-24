import { useState } from 'react'

const BlogForm = ({ createBlog }) => {
    const [visible, setVisible] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [newAuthor, setNewAuthor] = useState('')
    const [newUrl, setNewUrl] = useState('')

    const addBlog = async (event) => {
        event.preventDefault()

        const created = await createBlog({
            title: newTitle,
            author: newAuthor,
            url: newUrl
        })

        if (!created) {
            return
        }

        setNewTitle('')
        setNewAuthor('')
        setNewUrl('')
        setVisible(false)
    }

    if (!visible) {
        return (
            <div>
                <button type="button" onClick={() => setVisible(true)}>
                    create new blog
                </button>
            </div>
        )
    }

    return (
        <div>
            <h2>create new</h2>
            <form onSubmit={addBlog}>
                <div>
                    title:
                    <input
                        value={newTitle}
                        onChange={({ target }) => setNewTitle(target.value)}
                    />
                </div>
                <div>
                    author:
                    <input
                        value={newAuthor}
                        onChange={({ target }) => setNewAuthor(target.value)}
                    />
                </div>
                <div>
                    url:
                    <input
                        value={newUrl}
                        onChange={({ target }) => setNewUrl(target.value)}
                    />
                </div>
                <button type="submit">create</button>
                <button type="button" onClick={() => setVisible(false)}>cancel</button>
            </form>
        </div>
    )
}

export default BlogForm