require('dotenv').config();
const port = process.env.PORT;
const authRouters = require('./src/routes/authroute')

const session = require('express-session');
const express = require("express")
const cors = require("cors")
const logger = require('morgan')

const app = express()

app.use(cors({
   origin: `${process.env.PORT_CLIENT}`,
   credentials: true
}))

app.use(express.json())
app.use(logger('dev'))


app.use(session({
   secret: '123WERsfsdfsd',
   resave: false,
   saveUninitialized: true,
   cookie: {
     secure: false,      
     httpOnly: true,
     sameSite: 'lax'       
   }
}));

app.get('/', (req, res) => {
   res.send('testing')
})

const version = '/dev-wrgck-v1'

app.use(version, authRouters)


app.listen(port, () => {
   console.log(`Server running at http://localhost:${port}`)
})