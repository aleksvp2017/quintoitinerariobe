var express = require('express') //servidor http
var app = express()

//necessario para evitar o erro cors acessando localhost
var cors = require('cors')
app.use(cors())

//modulos necessários para leitura do token jwt
var bearerToken = require('express-bearer-token')
app.use(bearerToken())
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

//para ler .env
const dotenv = require('dotenv')
dotenv.config()

//NOTÍCIAS
var Noticias = require('./noticia.js')
app.get('/noticias', Noticias.listarNoticias)
app.post('/noticias', Noticias.incluirNoticia)
app.post('/noticias/:id', Noticias.alterarNoticia)
app.delete('/noticias/:id', Noticias.apagarNoticia)


//USUÁRIOS
var Usuario = require('./usuario.js')
app.post('/login', Usuario.login)
app.post('/usuarios', Usuario.registrar)
app.post('/recuperarSenha', Usuario.recuperarSenha)
app.post('/usuarios/:id', Usuario.alterar)
app.delete('/usuarios/:id', Usuario.excluir)
app.post('/alterarSenha', Usuario.alterarSenha)


//Para ler arquivo enviado no posto
const multer = require("multer")
//VAGAS
var Vagas = require('./vagas.js')
//o nome tem que bater com o do parâmetro enviado no formdata
app.post('/vagas/importar', multer().array("fileuploaded"), Vagas.importarPlanilha)
app.get('/vagas', Vagas.listar)
app.delete('/vagas', Vagas.excluir)
app.post('/vagas/:id', Vagas.alterar)

//WELCOME
app.get('/bemvindo', (request, response, next) => {
    response.status(200).json({ mensagem: "Seja bem vindo" })
} )


//MENSAGENS
var Mensagem = require('./mensagem.js')
app.post('/mensagem', Mensagem.enviar)

const chalk = require('chalk');
app.listen(process.env.PORT, () => { console.log(chalk.underline.blue('Server up and listening at ' + process.env.PORT))})


