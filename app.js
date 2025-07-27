require('dotenv').config();
const port = process.env.PORT;

const session = require('express-session');
const express = require("express")
const cors = require("cors")
const logger = require('morgan')
const { NotFoudn } = require('./src/errors');

const app = express()

app.use(cors({
   origin: `${process.env.PORT_CLIENT}`,
   credentials: true
}))


app.use(express.json())
app.use(logger('dev'))


app.use(session({
   secret: `${process.env.CAPTCHA_SECRET}`,
   resave: false,
   saveUninitialized: true,
   cookie: {
      secure: false,
      httpOnly: true,
      sameSite: 'lax'
   }
}));

// route all
const authRouters = require('./src/routes/authroute')
const adminRoutes = require('./src/routes/adminroute');
const errorHendelerMiddlewares = require('./src/errors/hendler-error');



app.get('/', (req, res) => {
   res.send('testing')
})

const version = '/dev-wrgck-v1'

app.use(version, authRouters)
app.use(version, adminRoutes)

app.use(errorHendelerMiddlewares)
app.use(NotFoudn)

app.listen(port, () => {
   console.log(`Server running at http://localhost:${port}`)
})