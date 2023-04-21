const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)

const Diary = require('../models/diary')
const User = require('../models/user')

describe('when there is initially some notes saved', () => {
  beforeEach(async () => {
    await Diary.deleteMany({})
    await Diary.insertMany(helper.initialDiary)
  })

  test('Diary notes are returned as json', async () => {
    await api
      .get('/api/diary')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('All diary entries are returned', async () => {
    const response = await api.get('/api/diary')

    expect(response.body).toHaveLength(helper.initialDiary.length)
  })

  describe('viewing a specific note', () => {
    test('A specific diary note is within the returned notes', async () => {
      const response = await api.get('/api/diary')

      const contents = response.body.map(r => r.content)

      expect(contents).toContain(
        'Browser can execute only JavaScript'
      )
    })

    test('A specific diary note can be viewed', async () => {
      const notesAtStart = await helper.notesInDb()

      const noteToView = notesAtStart[0]

      const resultNote = await api
        .get(`/api/diary/${noteToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(resultNote.body).toEqual(noteToView)
    })

    test('fails with statuscode 404 if note does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId()

      await api
        .get(`/api/diary/${validNonexistingId}`)
        .expect(404)
    })

    test('fails with statuscode 400 id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'

      await api
        .get(`/api/diary/${invalidId}`)
        .expect(400)
    })
  })

  describe('addition of a new note', () => {
    test('a valid note can be added ', async () => {
      const newNote = {
        content: 'async/await simplifies making async calls',
        //date: new Date(),
        important: true,
      }

      await api
        .post('/api/diary')
        .send(newNote)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const notesAtEnd = await helper.notesInDb()
      expect(notesAtEnd).toHaveLength(helper.initialDiary.length + 1)

      const contents = notesAtEnd.map(r => r.content)
      expect(contents).toContain(
        'async/await simplifies making async calls'
      )
    })


    test('fails with status code 400 if data invalid', async () => {
      const newNote = {
        important: true
      }

      await api
        .post('/api/diary')
        .send(newNote)
        .expect(400)

      const notesAtEnd = await helper.notesInDb()
      expect(notesAtEnd).toHaveLength(helper.initialDiary.length)
    })
  })

  describe('deletion of a note', () => {
    test('a note can be deleted', async () => {
      const notesAtStart = await helper.notesInDb()
      const noteToDelete = notesAtStart[0]

      await api
        .delete(`/api/diary/${noteToDelete.id}`)
        .expect(204)

      const notesAtEnd = await helper.notesInDb()

      expect(notesAtEnd).toHaveLength(
        helper.initialDiary.length - 1
      )

      const contents = notesAtEnd.map(r => r.content)

      expect(contents).not.toContain(noteToDelete.content)
    })
  })
})

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'heltu',
      name: 'Heli Tuomonen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('expected `username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('Login succeeeded', async () => {
    const newUser = {
      username: 'heltu',
      name: 'Heli Tuomonen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)

    const login = {
      username: 'heltu',
      password: 'salainen',
    }

    const result = await api
      .post('/api/login')
      .send(login)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const authorization = result.get('authorization')
    const token = result.body.token
    console.log(token)
    expect(authorization)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})