const express = require('express')
const cors = require('cors')
const salesRoutes = require('./routes/sales')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/sales', salesRoutes)

const PORT = process.env.PORT || 4000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/truestate'

async function start() {
  try {
    await mongoose.connect(MONGO_URI)
    app.listen(PORT, () => {
      console.log(`TruEstate backend running on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('Failed to connect to MongoDB', err)
    process.exit(1)
  }
}

start()
