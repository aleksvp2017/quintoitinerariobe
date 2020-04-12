const obterNoticias = async () => {
    const axios = require('axios').default
    await axios.get(process.env.DB_URL_NOTICIAS).then((response) => {
        var noticias = response.data
        console.log(noticias)
        return noticias
    }).catch((error) => {
        console.log('erro ao buscar noticias', error)
    })
}

const validarUsuario = async (email, password) => {
    var validUser = null
    const axios = require('axios').default
    await axios.get(process.env.DB_URL_USERS).then((response) => {
        users = response.data.filter((user) => user.email === email && user.senha === password)
        if (users.length > 0){
            console.log('usuario valido')
            validUser = users[0]
        }
        else{
            console.log('usuario nao valido')
        }
    }).catch((error) => {
        console.log('erro ao buscar usuarios', error)
    })
    return validUser
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

        if (users.length == 0){
            console.log('usuario ainda nao cadastrado')
        }
        else{
            console.log('usuario já cadastrado')
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
        console.log('entrou na promise')
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
        

        console.log('vai chamar sendMail')
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('enviou em helper')
                reject(error)
            }
            else {
                console.log('enviou em helper', info.response)
                resolve('Mensagem enviada com sucesso')
            }
        });
    })
}

module.exports = {
    obterNoticias, validarUsuario, procurarUsuario, gerarId, carregaDadosBanco, gravaDadosBanco, 
    sleep, enviaErroAdequado, encripta, enviarEmail
  };
