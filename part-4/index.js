const app = require('./app')
const { PORT } = require('./utils/config')
const { connectToDatabase } = require('./utils/db')

connectToDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    })
    .catch((error) => {
        console.error('error connecting to MongoDB:', error.message)
        process.exit(1)
    })
