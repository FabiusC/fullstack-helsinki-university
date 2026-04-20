const MONGODB_URI = process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bloglist_test'
    : process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bloglist'
const PORT = process.env.PORT || 3003
const SECRET = process.env.SECRET || 'test-secret'

module.exports = {
    MONGODB_URI,
    PORT,
    SECRET,
}
