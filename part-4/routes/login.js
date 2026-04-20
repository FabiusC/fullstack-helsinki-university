const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const loginRouter = require('express').Router()

const { SECRET } = require('../utils/config')
const User = require('../models/user')

loginRouter.post('/', async (request, response, next) => {
    const { username, password } = request.body

    try {
        const user = await User.findOne({ username })
        const passwordCorrect = user
            ? await bcrypt.compare(password, user.passwordHash)
            : false

        if (!user || !passwordCorrect) {
            return response.status(401).json({
                error: 'invalid username or password',
            })
        }

        const userForToken = {
            username: user.username,
            id: user.id,
        }

        const token = jwt.sign(userForToken, SECRET)

        response.status(200).json({
            token,
            username: user.username,
            name: user.name,
        })
    } catch (error) {
        next(error)
    }
})

module.exports = loginRouter