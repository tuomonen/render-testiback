const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://tuomonen:${password}@tuomonen.67bbn9h.mongodb.net/diaryApp?retryWrites=true&w=majority`
  //  `mongodb+srv://testi:${password}@cluster0.lmcujk2.mongodb.net/?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)

mongoose.connect(url)
  .then(() => console.log('db connected'))

const diarySchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
})

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  passwordHash: String,
  diary: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Diary'
    }
  ],
})

const Diary = mongoose.model('Diary', diarySchema)
const User = mongoose.model('User', userSchema)

const diary = new Diary({
  content: 'Backendin testiympäristö helpottaa sovelluskehitystä.',
  date: new Date(),
  important: true,
})

diary.save().then(() => {
  console.log('Diary entry saved!')
  //mongoose.connection.close()
})

const user2 = ( async () => {

  const password2 = 'salainen'
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password2, saltRounds)

  const user = new User( {
    username: 'heltu',
    name: 'Heli Tuomonen',
    passwordHash: passwordHash,
  })

  user.save().then(() => {
    console.log('User added!')
    mongoose.connection.close()
  })
})

user2()

/*
Diary.find({ important: true }).then(result => {
  //...
})
*/

/*
Diary.find({}).then(result => {
  result.forEach(entry => {
    console.log(entry)
  })
  mongoose.connection.close()
})
*/