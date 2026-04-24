import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

describe('Blog', () => {
    const blog = {
        title: 'The Practical Test Pyramid',
        author: 'Ham Vocke',
        url: 'https://example.com/test-pyramid',
        likes: 5,
        user: {
            name: 'Matti Luukkainen',
            username: 'mluukkai',
            id: '123'
        }
    }

    test('renders title and author but not url or likes by default', () => {
        const { container } = render(
            <Blog blog={blog} onLike={vi.fn()} onDelete={vi.fn()} canRemove={false} />
        )

        expect(container.querySelector('.blog-title-author')).toHaveTextContent(
            `${blog.title} ${blog.author}`
        )
        expect(container.querySelector('.blog-details')).not.toBeInTheDocument()
        expect(screen.queryByText(blog.url)).not.toBeInTheDocument()
        expect(screen.queryByText(`likes ${blog.likes}`)).not.toBeInTheDocument()
    })

    test('shows url and likes after clicking the view button', async () => {
        const user = userEvent.setup()

        render(<Blog blog={blog} onLike={vi.fn()} onDelete={vi.fn()} canRemove={false} />)

        await user.click(screen.getByRole('button', { name: 'view' }))

        expect(screen.getByText(blog.url)).toBeInTheDocument()
        expect(screen.getByText(`likes ${blog.likes}`)).toBeInTheDocument()
    })

    test('calls like handler twice when like button is clicked twice', async () => {
        const user = userEvent.setup()
        const likeHandler = vi.fn()

        render(<Blog blog={blog} onLike={likeHandler} onDelete={vi.fn()} canRemove={false} />)

        await user.click(screen.getByRole('button', { name: 'view' }))
        const likeButton = screen.getByRole('button', { name: 'like' })

        await user.click(likeButton)
        await user.click(likeButton)

        expect(likeHandler).toHaveBeenCalledTimes(2)
    })
})
