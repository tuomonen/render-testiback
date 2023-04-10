const mongoose = require('mongoose')

if (process.argv.length<3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

const url =
    `mongodb+srv://tuomonen:${password}@tuomonen.67bbn9h.mongodb.net/diaryApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const diarySchema = new mongoose.Schema({
    content: String,
    important: Boolean,
})

const Diary = mongoose.model('Diary', diarySchema)

const diary = new Diary({
    content: 'Toivottavasti React on hallussa.',
    important: true,
})

diary.save().then(result => {
    console.log('Diary entry saved!')
    mongoose.connection.close()
})

Diary.find({ important: true }).then(result => {
    // ...
})