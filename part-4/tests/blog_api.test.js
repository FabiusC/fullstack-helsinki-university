process.env.NODE_ENV = 'test'

const { test, describe, before, beforeEach, after } = require('node:test')
const assert = require('node:assert/strict')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const supertest = require('supertest')
const { MongoMemoryServer } = require('mongodb-memory-server')

const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)
let mongoServer

const initialUsers = [
    {
        username: 'hellas',
        name: 'Arto Hellas',
        password: 'salainen',
    },
    {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
    },
]

const initialBlogs = [
    {
        title: 'Things I Don\'t Know as of 2018',
        author: 'Dan Abramov',
        url: 'https://overreacted.io/things-i-dont-know-as-of-2018/',
        likes: 7,
    },
    {
        title: 'Microservices and the First Law of Distributed Objects',
        author: 'Martin Fowler',
        url: 'https://martinfowler.com/articles/microservice-trade-offs.html',
        likes: 10,
    },
]

const blogsInDb = async () => Blog.find({})

const loginWith = async (credentials) => {
    const response = await api.post('/api/login').send(credentials).expect(200)
    return response.body.token
}

before(async () => {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
})

beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('salainen', 10)

    const userOne = new User({
        username: initialUsers[0].username,
        name: initialUsers[0].name,
        passwordHash,
    })

    const userTwo = new User({
        username: initialUsers[1].username,
        name: initialUsers[1].name,
        passwordHash,
    })

    const savedUserOne = await userOne.save()
    const savedUserTwo = await userTwo.save()

    const blogOne = await Blog.create({
        ...initialBlogs[0],
        user: savedUserOne._id,
    })

    const blogTwo = await Blog.create({
        ...initialBlogs[1],
        user: savedUserTwo._id,
    })

    savedUserOne.blogs = [blogOne._id]
    savedUserTwo.blogs = [blogTwo._id]

    await savedUserOne.save()
    await savedUserTwo.save()
})

after(async () => {
    await mongoose.connection.close()
    await mongoServer.stop()
})

describe('GET /api/blogs', () => {
    test('returns the correct number of blogs in json format', async () => {
        const response = await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        assert.strictEqual(response.body.length, initialBlogs.length)
    })

    test('includes the creator information', async () => {
        const response = await api.get('/api/blogs').expect(200)
        const blog = response.body.find((item) => item.title === initialBlogs[0].title)

        assert.ok(blog.user)
        assert.strictEqual(blog.user.username, initialUsers[0].username)
        assert.strictEqual(blog.user.name, initialUsers[0].name)
    })
})

describe('GET /api/users', () => {
    test('returns users with their blogs', async () => {
        const response = await api.get('/api/users').expect(200)
        const user = response.body.find((item) => item.username === initialUsers[0].username)

        assert.strictEqual(response.body.length, initialUsers.length)
        assert.strictEqual(user.blogs.length, 1)
        assert.strictEqual(user.blogs[0].title, initialBlogs[0].title)
    })
})

describe('blog identifiers', () => {
    test('blog objects use id instead of _id', async () => {
        const response = await api.get('/api/blogs').expect(200)

        response.body.forEach((blog) => {
            assert.ok(blog.id)
            assert.strictEqual(blog._id, undefined)
        })
    })
})

describe('POST /api/users', () => {
    test('creates a new user with hashed password', async () => {
        const usersAtStart = await User.find({})
        const newUser = {
            username: 'newuser',
            name: 'New User',
            password: 'secret123',
        }

        const response = await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await User.find({})
        const savedUser = usersAtEnd.find((user) => user.username === newUser.username)

        assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
        assert.strictEqual(response.body.username, newUser.username)
        assert.strictEqual(response.body.passwordHash, undefined)
        assert.notStrictEqual(savedUser.passwordHash, newUser.password)
    })

    test('rejects missing username or password', async () => {
        const invalidUser = {
            name: 'Invalid User',
            password: 'secret123',
        }

        const response = await api
            .post('/api/users')
            .send(invalidUser)
            .expect(400)

        assert.match(response.body.error, /username and password/i)
    })

    test('rejects short username or password', async () => {
        const invalidUser = {
            username: 'ab',
            name: 'Invalid User',
            password: 'pw',
        }

        const response = await api
            .post('/api/users')
            .send(invalidUser)
            .expect(400)

        assert.match(response.body.error, /at least 3 characters/i)
    })

    test('rejects duplicate usernames', async () => {
        const invalidUser = {
            username: initialUsers[0].username,
            name: 'Duplicate User',
            password: 'secret123',
        }

        const response = await api
            .post('/api/users')
            .send(invalidUser)
            .expect(400)

        assert.match(response.body.error, /unique/i)
    })
})

describe('POST /api/login', () => {
    test('returns a token for valid credentials', async () => {
        const response = await api
            .post('/api/login')
            .send({
                username: initialUsers[0].username,
                password: initialUsers[0].password,
            })
            .expect(200)

        assert.ok(response.body.token)
        assert.strictEqual(response.body.username, initialUsers[0].username)
    })
})

describe('POST /api/blogs', () => {
    test('creates a new blog post for the authenticated user', async () => {
        const token = await loginWith({
            username: initialUsers[0].username,
            password: initialUsers[0].password,
        })

        const newBlog = {
            title: 'Async patterns in Node',
            author: 'Ada Lovelace',
            url: 'https://example.com/async-patterns',
            likes: 2,
        }

        const blogsAtStart = await blogsInDb()

        const response = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await blogsInDb()
        const user = await User.findOne({ username: initialUsers[0].username }).populate('blogs')

        assert.strictEqual(blogsAtEnd.length, blogsAtStart.length + 1)
        assert.strictEqual(response.body.title, newBlog.title)
        assert.strictEqual(response.body.author, newBlog.author)
        assert.strictEqual(response.body.url, newBlog.url)
        assert.strictEqual(response.body.likes, newBlog.likes)
        assert.strictEqual(response.body.user.username, initialUsers[0].username)
        assert.ok(user.blogs.some((blog) => blog.title === newBlog.title))
    })

    test('defaults likes to 0 when missing', async () => {
        const token = await loginWith({
            username: initialUsers[0].username,
            password: initialUsers[0].password,
        })

        const newBlog = {
            title: 'Missing likes is fine',
            author: 'Grace Hopper',
            url: 'https://example.com/missing-likes',
        }

        const response = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)

        assert.strictEqual(response.body.likes, 0)
    })

    test('returns 401 when token is missing', async () => {
        const newBlog = {
            title: 'Missing token is invalid',
            author: 'Grace Hopper',
            url: 'https://example.com/missing-token',
        }

        const response = await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)

        assert.match(response.body.error, /token missing or invalid/i)
    })

    test('returns 400 when title is missing', async () => {
        const token = await loginWith({
            username: initialUsers[0].username,
            password: initialUsers[0].password,
        })

        const newBlog = {
            author: 'Grace Hopper',
            url: 'https://example.com/missing-title',
            likes: 4,
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(400)
    })

    test('returns 400 when url is missing', async () => {
        const token = await loginWith({
            username: initialUsers[0].username,
            password: initialUsers[0].password,
        })

        const newBlog = {
            title: 'Missing url is invalid',
            author: 'Grace Hopper',
            likes: 4,
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(400)
    })
})

describe('PUT /api/blogs/:id', () => {
    test('updates the likes of a blog post', async () => {
        const blogsAtStart = await blogsInDb()
        const blogToUpdate = blogsAtStart[0]

        const updatedBlogData = {
            title: blogToUpdate.title,
            author: blogToUpdate.author,
            url: blogToUpdate.url,
            likes: blogToUpdate.likes + 1,
        }

        const response = await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(updatedBlogData)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const blogInDb = await Blog.findById(blogToUpdate.id)

        assert.strictEqual(response.body.likes, blogToUpdate.likes + 1)
        assert.strictEqual(response.body.title, blogToUpdate.title)
        assert.strictEqual(response.body.author, blogToUpdate.author)
        assert.strictEqual(response.body.url, blogToUpdate.url)
        assert.strictEqual(blogInDb.likes, blogToUpdate.likes + 1)
    })
})

describe('DELETE /api/blogs/:id', () => {
    test('deletes a blog post when the token belongs to the creator', async () => {
        const token = await loginWith({
            username: initialUsers[0].username,
            password: initialUsers[0].password,
        })

        const blogsAtStart = await blogsInDb()
        const blogToDelete = blogsAtStart.find((blog) => blog.title === initialBlogs[0].title)

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)

        const blogsAtEnd = await blogsInDb()

        assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
        assert.ok(!blogsAtEnd.some((blog) => blog.id === blogToDelete.id))
    })

    test('returns 401 when token is missing', async () => {
        const blogsAtStart = await blogsInDb()
        const blogToDelete = blogsAtStart[0]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .expect(401)
    })

    test('returns 401 when the token belongs to a different user', async () => {
        const token = await loginWith({
            username: initialUsers[1].username,
            password: initialUsers[1].password,
        })

        const blogsAtStart = await blogsInDb()
        const blogToDelete = blogsAtStart.find((blog) => blog.title === initialBlogs[0].title)

        const response = await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(401)

        assert.match(response.body.error, /only the creator/i)
    })
})