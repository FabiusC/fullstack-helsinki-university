const blogsRouter = require('express').Router()

const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response, next) => {
    try {
        const blogs = await Blog.find({}).populate('user', {
            username: 1,
            name: 1,
        })

        response.json(blogs)
    } catch (error) {
        next(error)
    }
})

blogsRouter.post('/', async (request, response, next) => {
    const user = request.user

    if (!user) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }

    const { title, author, url, likes } = request.body

    try {
        const blog = new Blog({
            title,
            author,
            url,
            likes,
            user: user.id,
        })

        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()

        const populatedBlog = await Blog.findById(savedBlog._id).populate('user', {
            username: 1,
            name: 1,
        })

        response.status(201).json(populatedBlog)
    } catch (error) {
        next(error)
    }
})

blogsRouter.put('/:id', async (request, response, next) => {
    const userId = typeof request.body.user === 'object' && request.body.user !== null
        ? request.body.user.id || request.body.user._id
        : request.body.user

    const blog = {
        title: request.body.title,
        author: request.body.author,
        url: request.body.url,
        likes: request.body.likes,
        user: userId,
    }

    try {
        const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
            new: true,
            runValidators: true,
            context: 'query',
        }).populate('user', {
            username: 1,
            name: 1,
        })

        response.json(updatedBlog)
    } catch (error) {
        next(error)
    }
})

blogsRouter.delete('/:id', async (request, response, next) => {
    try {
        const blog = await Blog.findById(request.params.id)

        if (!blog) {
            return response.status(404).end()
        }

        if (!request.user || blog.user.toString() !== request.user.id.toString()) {
            return response.status(401).json({
                error: 'only the creator can delete a blog',
            })
        }

        await Blog.findByIdAndDelete(request.params.id)
        await User.findByIdAndUpdate(request.user.id, {
            $pull: { blogs: blog._id },
        })

        response.status(204).end()
    } catch (error) {
        next(error)
    }
})

module.exports = blogsRouter