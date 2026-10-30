const dotenv = require('dotenv')

dotenv.config()

const app = require('./app')
const connectDB = require('./config/db')
const PORT = process.env.PORT || 5000

async function startServer() {
    await connectDB()

    app.listen(PORT, () => {
        console.log(`Server started at http://localhost:${PORT}`)
    })
}

startServer().catch((error) => {
    console.error('Failed to start server:', error)
    process.exitCode = 1
})