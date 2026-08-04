import express from 'express'
import { configDotenv } from 'dotenv'
import { connectDb } from './lib/mong.js';
import authRoutes from './routes/auth.route.js'
import userRoutes from './routes/user.route.js'

configDotenv()
const PORT = process.env.PORT || 3000;

const app = express()

app.use(express.json())


app.use('/', authRoutes)
app.use('/todos', userRoutes)


connectDb().then(() => {
    app.listen(PORT, () => {
        console.log(`The server is running on PORT: ${PORT}`)
    })
}) 