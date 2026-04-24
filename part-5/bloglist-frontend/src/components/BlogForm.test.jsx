import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

test('calls createBlog with correct details when creating a new blog', async () => {
    const user = userEvent.setup()
    const createBlog = vi.fn().mockResolvedValue({ id: '1' })

    const { container } = render(<BlogForm createBlog={createBlog} />)

    await user.click(screen.getByRole('button', { name: 'create new blog' }))

    const inputs = container.querySelectorAll('input')

    await user.type(inputs[0], 'Clean Code')
    await user.type(inputs[1], 'Robert C. Martin')
    await user.type(inputs[2], 'https://example.com/clean-code')

    await user.click(screen.getByRole('button', { name: 'create' }))

    expect(createBlog).toHaveBeenCalledTimes(1)
    expect(createBlog).toHaveBeenCalledWith({
        title: 'Clean Code',
        author: 'Robert C. Martin',
        url: 'https://example.com/clean-code'
    })
})
