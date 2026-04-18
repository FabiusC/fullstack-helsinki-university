const mongoose = require('mongoose')

const phoneNumberPattern = /^\d{2,3}-\d+$/

const url = process.env.MONGODB_URI

if (!url) {
    throw new Error('MONGODB_URI is not defined')
}

mongoose.set('strictQuery', false)
mongoose
    .connect(url)
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.error('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: [3, 'Name must be at least 3 characters long.'],
        required: [true, 'Name is required.'],
    },
    number: {
        type: String,
        minlength: [8, 'Phone number must be at least 8 characters long.'],
        required: [true, 'Number is required.'],
        validate: {
            validator: (value) => phoneNumberPattern.test(value),
            message: (props) =>
                `${props.value} is not a valid phone number. Use 2-3 digits, a dash, and then digits (e.g. 09-1234556).`,
        },
    },
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    },
})

module.exports = mongoose.model('Person', personSchema)
