require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const Diary = require('./models/diary')

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(express.json())
app.use(requestLogger)
app.use(cors())
app.use(express.static('build'))

let diary = []

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/diary', (request, response) => {
  Diary.find({}).then(entries => {
    response.json(entries)
  })
})

app.get('/api/diary/:id', (request, response) => {
  const id = Number(request.params.id)
  const note = Diary.find(note => note.id === id)

  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})


app.delete('/api/diary/:id', (request, response) => {
  const id = Number(request.params.id)
  diary = diary.filter(note => note.id !== id)

  response.status(204).end()
})

const generateId = () => {
  const maxId = diary.length > 0
      ? Math.max(...diary.map(n => n.id))
      : 0
  return maxId + 1
}

app.post('/api/diary', (request, response) => {
  const body = request.body

  if (!body.content) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const entry = {
    content: body.content,
    date: new Date(),
    important: body.important || false,
    id: generateId(),
  }

  diary = diary.concat(entry)

  response.json(entry)
})

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})