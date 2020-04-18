const obterNoticias = async () => {
    var noticias = []
    const axios = require('axios').default
    await axios.get(process.env.DB_URL_NOTICIAS).then((response) => {
        noticias = response.data
    }).catch((error) => {
        console.log('erro ao buscar noticias', error)
    })
    return noticias
}

const validarUsuario = async (email, password) => {
    var validUser = null
    const axios = require('axios').default
    await axios.get(process.env.DB_URL_USERS).then((response) => {
        users = response.data.filter((user) => user.email === email && user.senha === password)
        if (users.length > 0){
            validUser = users[0]
        }
    }).catch((error) => {
        console.log('erro ao buscar usuarios', error)
    })
    return validUser
}

const procurarNoticia = async (filtro) => {
    var noticia = null
    const axios = require('axios').default
    await axios.get(process.env.DB_URL_NOTICIAS).then((response) => {
        var noticias = response.data.filter((noticia) => {
            if (filtro.id && (noticia.id == filtro.id)){
                return noticia
            }
        })

        if (noticias.length != 0){
            noticia = noticias[0]
        }
    }).catch((error) => {
        console.log('erro ao buscar notícias', error)
    })
    return noticia
}

const procurarUsuario = async (filtro) => {
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
        console.log('erro ao buscar usuarios', error)
    })
    return user
}

function gerarId(usuarios){
    var id = 0;
    usuarios.map((usuario)=> {
        usuario.id > id ? id = usuario.id : id = id
    })
    return ++id
}

function carregaDadosBanco(){
    const fs = require('fs');
    let rawdata = fs.readFileSync(process.env.DB_FILE_PATH);
    return JSON.parse(rawdata);
}

const gravaDadosBanco = async (dados) => {
    const fs = require('fs');
    return fs.writeFile(process.env.DB_FILE_PATH, JSON.stringify(dados, null, 2), 
        (error) => {
            return error
        });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function enviaErroAdequado(err, res) {
    let msgErro = "Token não encontrado"
    if (err.name.startsWith('TokenExpiredError')) {
        console.log('Token expirado')
        msgErro = "invalid_token"
    }
    res.status(401).send(msgErro)
}

function encripta(senha) {
    const crypto = require('crypto')
    let senhaHash = crypto.createHash('sha512').update(senha).digest('hex')
    return senhaHash
}

const enviarEmail = (assunto, mensagem, destinatario) => {
    return new Promise((resolve,reject)=>{
        var nodemailer = require('nodemailer');
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
            user: 'aleksvp@gmail.com',
            pass: 'kfkkmgybshywfvxt'
            }
        });
        
        var mailOptions = {
            from: 'aleksvp@gmail.com',
            to: destinatario,
            subject: assunto,
            html: mensagem
        };
        

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error)
            }
            else {
                resolve('Mensagem enviada com sucesso')
            }
        });
    })
}

module.exports = {
    obterNoticias, validarUsuario, procurarUsuario, gerarId, carregaDadosBanco, gravaDadosBanco, 
    sleep, enviaErroAdequado, encripta, enviarEmail, procurarNoticia
  };
