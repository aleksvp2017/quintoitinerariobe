//const notes = require('./notes.js')

//console.log(notes.getNotes())
//console.log(process.argv)
//console.log(global)


const yargs = require('yargs')
const notes = require('./notes.js')



yargs.command({
    command: 'add',
    describe: 'Add a note',
    //a sintaxe abaixo é do EC6.. método não precisa da palavra function
    handler(argv) {
        notes.addNote({title: argv.title, body: argv.body})
    },
    builder:{
        title:{
            describe: 'Title of note',
            demandOption: true,
            type: 'string'
        },
        body:{
            describe: 'Body of note',
            demandOption: true,
            type: 'string'
        }        
    }
}
)

yargs.command({
    command: 'remove',
    describe: 'Remove a note',
    handler: argv => notes.removeNote(argv.title),
    builder:{
        title:{
            describe: 'Title of note',
            demandOption: true,
            type: 'string'
        }      
    }
}
)

yargs.command({
    command: 'list',
    describe: 'List notes',
    handler: () => {
       notes.listAllNotes()
    }
}
)


yargs.command({
    command: 'read',
    describe: 'Read notes',
    handler: (argv) => {
        notes.readNote(argv.title)
    },
    builder: {
        title:{
            describe: 'Title of note',
            demandOption: true,
            type: 'string'
        }  
    }
}
)

//tem que chamar esse método ou o argv para que ele faça o parse dos parametros
yargs.parse()

/*
const fs = require ('fs')
var data = JSON.parse(fs.readFileSync('dados.json').toString())
data.nome = 'Aleksander Velozo Pascoal'
fs.writeFileSync('dados.json', JSON.stringify(data, null, 2) )
*/