import express from 'express'
import session from 'express-session'

import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

import passport from 'passport'
import Strategy from 'passport-twitter'

import dotenv from 'dotenv'
dotenv.config()

import cors from 'cors'
import fileUpload from 'express-fileupload'

import mongoose from 'mongoose'

import { BACKEND_URL } from './config'

Promise = require('bluebird')
import routes from './routes'
import { MONGO_HOST, CONSUMER_KEY, CONSUMER_SECRET } from './config'
mongoose.Promise = Promise

const HOST = MONGO_HOST || process.env.MONGO_HOST
mongoose.connect(HOST)
mongoose.connection.on('error', () => {
  throw new Error(`Unable to connect to database: ${HOST}`)
})

const app = express()

passport.use(
  new Strategy(
    {
      consumerKey: CONSUMER_KEY,
      consumerSecret: CONSUMER_SECRET,
      callbackURL: `${BACKEND_URL}/auth/twitter/callback`
    }, (token, tokenSecret, profile, cb) => {
      return cb(null, profile)
    }
  )
)

passport.serializeUser(function (user, callback) {
  callback(null, user)
})

passport.deserializeUser(function (obj, callback) {
  callback(null, obj)
})

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
// app.use(upload.array())

app.use(session({
  secret: 'test',
  resave: true,
  saveUninitialized: true
}));

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session())

app.use(fileUpload())

app.use('/api', routes)

app.get('/auth/twitter',
  passport.authenticate('twitter'))

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/' }),
  function (req, res) {
    const user = req['user']
    res.redirect(`/?oauth_token=${req.query.oauth_token}&oauth_verifier=${req.query.oauth_verifier}&id=${user['id']}&username=${user['username']}`);
  }
)

app.use(express.static(`${__dirname}/build`))

app.use('/*', (req, res) => {
  res.sendFile(`${__dirname}/build/index.html`)
})

const port = process.env.PORT || 53134

app.listen(port, () => {
  console.info(`server started on port ${port}`) // eslint-disable-line no-console
})