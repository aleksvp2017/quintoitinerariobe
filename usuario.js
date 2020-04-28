var Helper = require('./helper.js')
const chalk = require('chalk')

const validar = async (email, password) => {
    var validUser = null
    const axios = require('axios').default
    await axios.get(process.env.DB_URL_USERS).then((response) => {
        users = response.data.filter((user) => user.email === email && user.senha === password)
        if (users.length > 0){
            validUser = users[0]
        }
    }).catch((error) => {
        console.log(chalk.red('erro ao buscar usuarios', error))
    })
    return validUser
}


const login = async function (req, res, next) {
    var usuario = await validar(req.body.usuario.email, req.body.usuario.senha)
    if (usuario != null) {
        var jwt = require('jsonwebtoken')
        let token = jwt.sign({
            name: usuario.nome,
            email: usuario.email
        }, process.env.SECRET, {
            expiresIn: 6000
        })
        res.status(200).json({ auth: true, usuario: { ...usuario, senha: '', token: token } })
        next()
    }
    else {
        res.status(401).json({ error: 'E-mail ou senha incorretos' })
    }
}

const buscar = async (filtro) => {
    var user = null
    const axios = require('axios').default
    await axios.get(process.env.DB_URL_USERS).then((response) => {
        users = response.data.filter((user) => {
            if (filtro.email && (user.email === filtro.email)){
                return user
            }
            if (filtro.id && (user.id == filtro.id)){
                return user
            }
        })

        if (users.length != 0){
            user = users[0]
        }
    }).catch((error) => {
        console.log(chalk.red('erro ao buscar usuarios', error))
    })
    return user
}

const registrar = async function(req, res, next) {
    //verifica se ja existe email na base
    var usuario = await buscar({email:req.body.usuario.email})
    if (usuario == null){
        let dados = Helper.carregaDadosBanco()
       
        dados.usuarios.push({id: Helper.gerarId(dados.usuarios), ...req.body.usuario})

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
}

async function regerarSenhaUsuario(usuario) {
    let senhaGerada = Math.random().toString(36).slice(-8)
    usuario.senha = Helper.encripta(senhaGerada)
    let dados = Helper.carregaDadosBanco()
    dados.usuarios = dados.usuarios.filter((usuario) => usuario.id != usuario.id)
    dados.usuarios.push(usuario)
    let erroAoGravar = false
    await Helper.gravaDadosBanco(dados).then().catch((error) => erroAoGravar = error)
    return { erroAoGravar, senhaGerada }
}

const recuperarSenha = async function (req, res, next) {
    var usuario = await buscar({ email: req.body.email })
    if (usuario == null) {
        res.status(401).json({ error: 'Email não cadastrado' })
    }
    else {
        let { erroAoGravar, senhaGerada } = await regerarSenhaUsuario(usuario)
        if (erroAoGravar) {
            res.status(401).json({ error: `Error ao gravar dados ${erroAoGravar}` })
        }
        else {
            Mensagem.enviarEmail('Redefinição de senha', `Sua nova senha é ${senhaGerada}`, req.body.email).then((mensagem) => {
                res.status(200).json({ mensagem: 'Nova senha enviada com sucesso' })
                next()
            }).catch(error => {
                console.log(chalk.red(error))
                res.status(401).json({ error: `Error ao enviar mensagem ${error}` })
            })
        }
    }
}

const alterar = async function (req, res, next) {
    var jwt = require('jsonwebtoken')
    jwt.verify(req.token, process.env.SECRET, async (err, decoded) => {
        if (err) {
            Helper.enviaErroAdequado(err, res)
        }
        else {
            var usuario = await buscar({ id: req.body.usuario.id })
            if (usuario == null) {
                res.status(401).json({ error: 'Usuário não encontrado' })
            }
            else {
                let dados = Helper.carregaDadosBanco()
                req.body.usuario.senha = usuario.senha
                dados.usuarios = dados.usuarios.filter((usuario) => usuario.id != usuario.id)
                dados.usuarios.push(req.body.usuario)
                let erroAoGravar = false
                await Helper.gravaDadosBanco(dados).then().catch((error) => erroAoGravar = error)
                if (erroAoGravar) {
                    res.status(401).json({ error: `Error ao gravar dados ${erroAoGravar}` })
                }
                else {
                    res.status(200).json({ mensagem: 'Dados alterados com sucesso' })
                }
            }
        }
    })
}

const excluir = async function (req, res, next) {
    var jwt = require('jsonwebtoken')
    jwt.verify(req.token, process.env.SECRET, async (err, decoded) => {
        if (err) {
            Helper.enviaErroAdequado(err, res)
        }
        else {
            var usuario = await buscar({ id: req.body.usuario.id })
            if (usuario == null) {
                res.status(401).json({ error: 'Usuário não encontrado' })
            }
            else {
                let dados = Helper.carregaDadosBanco()
                dados.usuarios = dados.usuarios.filter((usuario) => usuario.id != usuario.id)
                let erroAoGravar = false
                await Helper.gravaDadosBanco(dados).then().catch((error) => erroAoGravar = error)
                if (erroAoGravar) {
                    res.status(401).json({ error: `Error ao gravar dados ${erroAoGravar}` })
                }
                else {
                    res.status(200).json({ mensagem: 'Usuário excluído com sucesso' })
                    next()
                }
            }
        }
    })
}

const alterarSenha = async function (req, res, next) {
    var jwt = require('jsonwebtoken')
    jwt.verify(req.token, process.env.SECRET, async (err, decoded) => {
        if (err) {
            Helper.enviaErroAdequado(err, res)
        }
        else {
            var usuario = await validar(req.body.usuario.email, req.body.usuario.senha)
            if (usuario == null) {
                res.status(401).json({ error: 'Senha atual incorreta' })
            }
            else {
                let dados = Helper.carregaDadosBanco()
                usuario.senha = req.body.senhaNova
                dados.usuarios = dados.usuarios.filter((usuario) => usuario.id != usuario.id)
                dados.usuarios.push(usuario)
                let erroAoGravar = false
                await Helper.gravaDadosBanco(dados).then().catch((error) => erroAoGravar = error)
                if (erroAoGravar) {
                    res.status(401).json({ error: `Error ao gravar dados ${erroAoGravar}` })
                }
                else {
                    res.status(200).json({ mensagem: 'Senha alterada com sucesso' })
                    next()
                }
            }
        }
    })
}

module.exports = {
    login, registrar, buscar, recuperarSenha, alterar, excluir, alterarSenha
}