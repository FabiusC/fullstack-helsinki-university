import { useState } from 'react'

const Blog = ({ blog, onLike, onDelete, canRemove }) => {
  const [showDetails, setShowDetails] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  return (
    <div style={blogStyle} className="blog">
      <div className="blog-title-author">
        {blog.title} {blog.author}
        <button type="button" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'hide' : 'view'}
        </button>
      </div>

      {showDetails && (
        <div className="blog-details">
          <div>{blog.url}</div>
          <div>
            likes {blog.likes}
            <button type="button" onClick={() => onLike(blog)}>like</button>
          </div>
          <div>{blog.user?.name}</div>
          {canRemove && (
            <button type="button" onClick={() => onDelete(blog)}>
              remove
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Blog