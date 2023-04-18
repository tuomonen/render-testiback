const Diary = require('../models/diary')
const User = require('../models/user')

const initialDiary = [
  {
    content: 'HTML is easy',
    important: false,
    //date: new Date()
  },
  {
    content: 'Browser can execute only JavaScript',
    important: true,
    //date: new Date()
  }
]

const nonExistingId = async () => {
  const note = new Diary({ content: 'willremovethissoon' })
  await note.save()
  await note.deleteOne()

  return note._id.toString()
}

const notesInDb = async () => {
  const notes = await Diary.find({})
  return notes.map(note => note.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialDiary, nonExistingId, notesInDb, usersInDb,
}