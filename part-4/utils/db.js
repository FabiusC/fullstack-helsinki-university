const mongoose = require('mongoose')
const { MONGODB_URI } = require('./config')

const connectToDatabase = () => {
    mongoose.set('strictQuery', false)

    return mongoose.connect(MONGODB_URI)
}

module.exports = {
    connectToDatabase,
}
