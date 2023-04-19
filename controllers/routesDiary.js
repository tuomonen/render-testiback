const diaryRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Diary = require('../models/diary')
const User = require('../models/user')


const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}


diaryRouter.get('/', async (request, response) => {
  const diary = await Diary
    .find({}).populate('user', { username: 1, name: 1 })

  response.json(diary)
})

diaryRouter.get('/:id', async(request, response) => {
  const note = await Diary.findById(request.params.id)
  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

diaryRouter.post('/', async (request, response) => {
  const body = request.body

  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)

  //const user = await User.findById(body.userId)

  const note = new Diary({
    content: body.content,
    important: body.important || false,
    date: new Date(),
    user: user._id
  })

  const savedNote = await note.save()
  user.diary = user.diary.concat(savedNote._id)
  await user.save()

  response.json(savedNote)
})

diaryRouter.delete('/:id', async (request, response) => {
  await Diary.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

diaryRouter.put('/:id', (request, response, next) => {
  const body = request.body
  const diary = {
    content: body.content,
    important: body.important,
    date: body.content
  }

  Diary.findByIdAndUpdate(request.params.id, diary, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

module.exports = diaryRouter