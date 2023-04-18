const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
    `mongodb+srv://testi:${password}@testikanta.htwzxnf.mongodb.net/diaryApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)
  .then(() => console.log('db connected'))

const diarySchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
})

const Diary = mongoose.model('Diary', diarySchema)

const diary = new Diary({
  content: 'Toivottavasti React on hallussa.',
  date: new Date(),
  important: true,
})

diary.save().then(() => {
  console.log('Diary entry saved!')
  mongoose.connection.close()
})

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