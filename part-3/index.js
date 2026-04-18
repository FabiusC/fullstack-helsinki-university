const express = require('express')
const morgan = require('morgan')
const path = require('path')
const Person = require('./models/person')

const app = express()
const PORT = process.env.PORT || 3001

morgan.token('postBody', (req) => {
    if (req.method !== 'POST') {
        return ''
    }

    return JSON.stringify(req.body)
})

app.use(express.json())
app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms :postBody')
)

app.get('/api/persons', (req, res, next) => {
    Person.find({})
        .then((persons) => {
            res.json(persons)
        })
        .catch((error) => next(error))
})

app.get('/info', (req, res, next) => {
    Person.countDocuments({})
        .then((count) => {
            const infoText = `Phonebook has info for ${count} people\n${new Date()}`
            res.send(infoText)
        })
        .catch((error) => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then((person) => {
            if (person) {
                return res.json(person)
            }

            return res.status(404).end()
        })
        .catch((error) => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
        .then(() => {
            res.status(204).end()
        })
        .catch((error) => {
            next(error)
        })
})

app.post('/api/persons', (req, res, next) => {
    const { name, number } = req.body

    if (!name || !number) {
        return res.status(400).json({ error: 'name or number is missing' })
    }

    const person = new Person({
        name,
        number
    })

    person
        .save()
        .then((savedPerson) => {
            res.status(201).json(savedPerson)
        })
        .catch((error) => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const { name, number } = req.body

    if (!name || !number) {
        return res.status(400).json({ error: 'name or number is missing' })
    }

    const person = {
        name,
        number
    }

    Person.findByIdAndUpdate(req.params.id, person, {
        new: true,
        runValidators: true,
        context: 'query'
    })
        .then((updatedPerson) => {
            if (!updatedPerson) {
                return res.status(404).end()
            }

            return res.json(updatedPerson)
        })
        .catch((error) => next(error))
})

const unknownEndpoint = (req, res) => {
    res.status(404).json({ error: 'unknown endpoint' })
}

const errorHandler = (error, req, res, next) => {
    if (error.name === 'CastError') {
        return res.status(400).json({ error: 'malformatted id' })
    }

    if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message })
    }

    return next(error)
}

app.use('/api', unknownEndpoint)
app.use(errorHandler)

app.use(express.static('dist'))

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
