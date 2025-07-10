const express = require("express")
const port = 5002
const cors = require("cors")
const logger = require('morgan')

const app = express()

app.use(cors())
app.use(express.json())
app.use(logger('dev'))

app.get('/', (req, res) => {
   res.send('testing')
})



const authRouters = require('./src/routes/authroute')

const version = '/dev-wrgck-v1'

app.use(version, authRouters)


app.listen(port, () => {
   console.log(`Server running at http://localhost:${port}`)
})