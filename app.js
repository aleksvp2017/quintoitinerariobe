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
const dotenv = require('dotenv');
dotenv.config();

var Helper = require('./helper.js')



app.post('/noticias', async (req, res) => {
    console.log('tentando acessar endpoint protegido')
    //await sleep(20000).then(() => { console.log("teste atraso!"); });
    var jwt = require('jsonwebtoken')
    jwt.verify(req.token, process.env.SECRET, async (err, decoded) => {
        if (err){
            Helper.enviaErroAdequado(err, res)
        }
        else{
            var noticias = await Helper.obterNoticias()
            res.status(200).json({noticias})
        }
    })
})


//endpoint para realizar o login, criando o token
app.post('/login', async function(req, res, next) {
    var usuario = await Helper.validarUsuario(req.body.usuario, req.body.senha)
    if (usuario != null){
        console.log('gerando token')
        var jwt = require('jsonwebtoken')
        let token = jwt.sign({ 
                name: usuario.nome, 
                email: usuario.email
            }, process.env.SECRET, {
            expiresIn: 6000
        })
        res.status(200).json( {auth: true, usuario: {...usuario, senha:'', token: token}})
        next()
    }
    else{
        res.status(401).json({error: 'E-mail ou senha incorretos'})
    }
})



//endpoint para registrar novo usuario
app.post('/usuario/registrar', async function(req, res, next) {
    //verifica se ja existe email na base
    var usuario = await Helper.procurarUsuario({email:req.body.usuario.email})
    if (usuario == null){
        let dados = Helper.carregaDadosBanco()
       
        dados.usuarios.push({id: Helper.gerarId(dados.usuarios), ...req.body.usuario, senha: Helper.encripta(req.body.usuario.senha)})
        console.log(Helper.gerarId(dados.usuarios));

        let erroAoGravar = false
        await Helper.gravaDadosBanco(dados).then().catch((error)=> erroAoGravar = error)
        if (erroAoGravar){
            res.status(401).json({error: `Error ao gravar dados ${erroAoGravar}`})
        }
        else{
            res.status(200).json( {mensagem: 'Usuário registrado com sucesso'})
            next()
        }
    }
    else{
        res.status(401).json({error: 'E-mail já registrado'})
    }
})

//endpoint para alterar um usuario
app.post('/usuario/alterar', async function(req, res, next) {
    var jwt = require('jsonwebtoken')
    jwt.verify(req.token, process.env.SECRET, async (err, decoded) => {
        if (err){
            Helper.enviaErroAdequado(err, res)
        }
        else{
            var usuario = await Helper.procurarUsuario({id: req.body.usuario.id})
            if (usuario == null){
                res.status(401).json({error: 'Usuário não encontrado'})
            }
            else{
                let dados = Helper.carregaDadosBanco()
                req.body.usuario.senha = usuario.senha
                dados.usuarios = dados.usuarios.filter((usuario) => usuario.id != usuario.id)
                dados.usuarios.push(req.body.usuario)
                let erroAoGravar = false
                await Helper.gravaDadosBanco(dados).then().catch((error)=> erroAoGravar = error)
                if (erroAoGravar){
                    res.status(401).json({error: `Error ao gravar dados ${erroAoGravar}`})
                }
                else{
                    res.status(200).json( {mensagem: 'Dados alterados com sucesso'})
                    next()
                }
            }

        }
    })
})

//endpoint para excluir um usuario
app.post('/usuario/excluir', async function(req, res, next) {
    var jwt = require('jsonwebtoken')
    jwt.verify(req.token, process.env.SECRET, async (err, decoded) => {
        if (err){
            Helper.enviaErroAdequado(err, res)
        }
        else{
            var usuario = await Helper.procurarUsuario({id: req.body.usuario.id})
            if (usuario == null){
                res.status(401).json({error: 'Usuário não encontrado'})
            }
            else{
                let dados = Helper.carregaDadosBanco()
                dados.usuarios = dados.usuarios.filter((usuario) => usuario.id != usuario.id)
                let erroAoGravar = false
                await Helper.gravaDadosBanco(dados).then().catch((error)=> erroAoGravar = error)
                if (erroAoGravar){
                    res.status(401).json({error: `Error ao gravar dados ${erroAoGravar}`})
                }
                else{
                    res.status(200).json( {mensagem: 'Usuário excluído com sucesso'})
                    next()
                }
            }

        }
    })
})

//endpoint para excluir um usuario
app.post('/mensagem', async function(req, res, next) {
    var jwt = require('jsonwebtoken')
    jwt.verify(req.token, process.env.SECRET, async (err, decoded) => {
        if (err){
            Helper.enviaErroAdequado(err, res)
        }
        else{
            console.log('vai enviar')
            Helper.enviarEmail('Fale conosco', mensagemFormatada(req.body), process.env.EMAIL_FALECONSCO).then((mensagem) => {
                console.log('enviou')
                res.status(200).json( {mensagem})
            }).catch( error => {
                console.log(error);
                res.status(401).json({error: `Error ao enviar mensagem ${error}`})
            })
        }
    })
})

function mensagemFormatada(mensagem){
    return "Mensagem enviada por " + mensagem.usuario + "<br/><br/>" +
           "Assunto: " + mensagem.assunto + "<br/><br/>" +
           "Conteúdo: " + mensagem.conteudo
}



//endpoint para alterar um usuario
app.post('/recuperarSenha', async function(req, res, next) {
    var usuario = await Helper.procurarUsuario({email: req.body.email})
    if (usuario == null){
        res.status(401).json({error: 'Email não cadastrado'})
    }
    else{
        let { erroAoGravar, senhaGerada } = await alteraSenhaUsuario(usuario)
        if (erroAoGravar){
            res.status(401).json({error: `Error ao gravar dados ${erroAoGravar}`})
        }
        else{
            Helper.enviarEmail('Redefinição de senha', `Sua nova senha é ${senhaGerada}`, req.body.email).then((mensagem) => {
                res.status(200).json( {mensagem: 'Nova senha enviada com sucesso'})
                next()    
            }).catch( error => {
                console.log(error);
                res.status(401).json({error: `Error ao enviar mensagem ${error}`})
            })            
        }
    }
})

//endpoint para alterar a senha de um usuário
app.post('/usuario/alterarSenha', async function(req, res, next) {
    console.log('Parametros:', req.body)
    var jwt = require('jsonwebtoken')
    jwt.verify(req.token, process.env.SECRET, async (err, decoded) => {
        if (err){
            Helper.enviaErroAdequado(err, res)
        }
        else{
            var usuario = await Helper.validarUsuario(req.body.email, req.body.senha)
            console.log('Usuario validado:', usuario)
            if (usuario == null){
                res.status(401).json({error: 'Senha atual incorreta'})
            }
            else{
                let dados = Helper.carregaDadosBanco()
                usuario.senha = req.body.senhaNova
                console.log('Usuario alterado', usuario)
                dados.usuarios = dados.usuarios.filter((usuario) => usuario.id != usuario.id)
                dados.usuarios.push(usuario)
                let erroAoGravar = false
                await Helper.gravaDadosBanco(dados).then().catch((error)=> erroAoGravar = error)
                if (erroAoGravar){
                    res.status(401).json({error: `Error ao gravar dados ${erroAoGravar}`})
                }
                else{
                    res.status(200).json( {mensagem: 'Senha alterada com sucesso'})
                    next()
                }
            }

        }
    })
})


async function alteraSenhaUsuario(usuario) {
    let senhaGerada = Math.random().toString(36).slice(-8)
    usuario.senha = Helper.encripta(senhaGerada)
    let dados = Helper.carregaDadosBanco()
    dados.usuarios = dados.usuarios.filter((usuario) => usuario.id != usuario.id)
    dados.usuarios.push(usuario)
    let erroAoGravar = false
    await Helper.gravaDadosBanco(dados).then().catch((error) => erroAoGravar = error)
    return { erroAoGravar, senhaGerada }
}

function mensagemRecuperacaoSenha(email, senha){
    return 
}


app.listen(process.env.PORT, () => { console.log('Server up and listening at ' + process.env.PORT)})


