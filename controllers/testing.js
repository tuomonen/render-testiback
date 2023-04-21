const router = require('express').Router()
const Diary = require('../models/diary')
const User = require('../models/user')

router.post('/reset', async (request, response) => {
  await Diary.deleteMany({})
  await User.deleteMany({})

  response.status(204).end()
})

module.exports = router