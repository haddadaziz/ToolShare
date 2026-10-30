const express = require('express')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger');
const routes = require('./routes')
const AppError = require('./utils/appError')
const errorMiddleware = require('./middlewares/error.middleware')
const swaggerUi = require('swagger-ui-express')
const swaggerDefinition = require('./config/swagger')

const app = express()

app.use(express.json())
app.get('/api-docs.json', (req, res) => res.json(swaggerDefinition))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition))
app.use(routes)

app.use((req, res, next) => {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404))
})
app.use(errorMiddleware)

module.exports = app
