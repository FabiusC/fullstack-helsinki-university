const jwt = require('jsonwebtoken')
const { SECRET } = require('./config')
const User = require('../models/user')

const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')

    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        request.token = authorization.substring(7)
    } else {
        request.token = null
    }

    next()
}

const userExtractor = async (request, response, next) => {
    if (!request.token) {
        request.user = null
        return next()
    }

    try {
        const decodedToken = jwt.verify(request.token, SECRET)
        const user = await User.findById(decodedToken.id)

        request.user = user || null
    } catch (error) {
        request.user = null
    }

    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
    if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    if (error.name === 'CastError') {
        return response.status(400).json({ error: 'malformatted id' })
    }

    if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({ error: 'token invalid' })
    }

    next(error)
}

module.exports = {
    tokenExtractor,
    userExtractor,
    unknownEndpoint,
    errorHandler,
}