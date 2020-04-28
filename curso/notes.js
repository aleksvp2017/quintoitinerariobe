const fs = require('fs')
const fileName = 'dados.json'
const chalk = require('chalk')

const saveNotes = (notes) => {
    fs.writeFileSync(fileName, JSON.stringify(notes, null, 2))
}

const loadNotes = () => {
    var notes = []
    try{
        var buffer = fs.readFileSync(fileName)
        if (buffer.toString() != ''){
            notes = JSON.parse(buffer)
        }
    }
    catch (error){
        console.log('Arquivo não existe, criando...')
    }
    return notes
}

const readNote= (title) => {
    var notes = loadNotes()
    var note = notes.find((note) => note.title === title)
    if (note){
        console.log(chalk.green(note.title))
        console.log(note.body)
    }
    else{
        console.log(chalk.red('No note found'))
    }
}

const addNote= (newNote) => {
    var notes = loadNotes()
    var duplicatedNote = notes.find((note) => note.title == newNote.title)
    if (duplicatedNote){
        console.log(chalk.red('Note with this title already saved'))
    }
    else{
        notes.push(newNote)
        saveNotes(notes)
        console.log(chalk.green('Note added'))
    }
}

const removeNote = (title) => {
    var notes = loadNotes()
    var notesToKeep = notes.filter(note => note.title != title)
    if (notes.length == notesToKeep.length){
        console.log(chalk.red('No notes found'))
    }
    else{
        console.log(chalk.green('Note removed'))
        saveNotes(notesToKeep)
    }
}

const listAllNotes = () => {
    const notes = loadNotes()
    if (notes.length > 0){
        console.log(chalk.green('Your notes:'))
        notes.map((note) => console.log(note.title))
    }
    else{   
        console.log(chalk.yellow('No notes avaiable'))
    }
}



module.exports ={
    addNote, removeNote, listAllNotes, readNote
}