var Helper = require('./helper.js')
var moment = require('moment');


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

const listarNoticias = async (req, res) => {
    //await sleep(20000).then(() => { console.log("teste atraso!"); });
    var jwt = require('jsonwebtoken')
    jwt.verify(req.token, process.env.SECRET, async (err, decoded) => {
        if (err) {
            Helper.enviaErroAdequado(err, res)
        }
        else {
            var noticias = await obterNoticias()
            res.status(200).json({ noticias })
        }
    })
}

const incluirNoticia =  async (req, res) => {
    var jwt = require('jsonwebtoken')
    jwt.verify(req.token, process.env.SECRET, async (err, decoded) => {
        if (err){
            Helper.enviaErroAdequado(err, res)
        }
        else{
            let dados = Helper.carregaDadosBanco()
            let dataPublicacao = moment().format("DD/MM/YYYY")
            let id = Helper.gerarId(dados.noticias)
            var noticia = {...req.body.noticia, id: id,datapublicacao: dataPublicacao}
            dados.noticias.push(noticia)
            let erroAoGravar = false
            await Helper.gravaDadosBanco(dados).then().catch((error)=> erroAoGravar = error)
            if (erroAoGravar){
                res.status(401).json({error: `Error ao gravar dados ${erroAoGravar}`})
            }
            else{
                res.status(200).json( {mensagem: 'Notícia registrada com sucesso', noticia})
            }    
        }
    })
}

const procurarNoticia = async (filtro) => {
    var noticiaIndice = {
        noticia: null,
        indice: -1
    }
    const axios = require('axios').default
    await axios.get(process.env.DB_URL_NOTICIAS).then((response) => {
        response.data.filter((noticia, index) => {
            if (filtro.id && (noticia.id == filtro.id)){
                noticiaIndice.indice = index
                noticiaIndice.noticia = noticia
                return noticia
            }
        })

    }).catch((error) => {
        console.log('erro ao buscar notícias', error)
    })
    return noticiaIndice
}

const alterarNoticia =  async (req, res) => {
    var jwt = require('jsonwebtoken')
    jwt.verify(req.token, process.env.SECRET, async (err, decoded) => {
        if (err){
            Helper.enviaErroAdequado(err, res)
        }
        else{
            var noticiaIndice = await procurarNoticia({id: req.body.noticia.id})
            if (noticiaIndice.noticia == null){
                res.status(401).json({error: 'Notícia não encontrada'})
            }
            else{
                let dados = Helper.carregaDadosBanco()
                dados.noticias.splice(noticiaIndice.indice, 1)
                var dataPublicacao = moment().format("DD/MM/YYYY")
                var noticia = { ...req.body.noticia, datapublicacao: dataPublicacao}
                dados.noticias.push(noticia)
                let erroAoGravar = false
                await Helper.gravaDadosBanco(dados).then().catch((error)=> erroAoGravar = error)
                if (erroAoGravar){
                    res.status(401).json({error: `Error ao gravar dados ${erroAoGravar}`})
                }
                else{
                    res.status(200).json( {mensagem: 'Notícia alterada com sucesso', noticia})
                }    
            }
        }
    })
}

const apagarNoticia =  async (req, res) => {
    var jwt = require('jsonwebtoken')
    jwt.verify(req.token, process.env.SECRET, async (err, decoded) => {
        if (err){
            Helper.enviaErroAdequado(err, res)
        }
        else{
            let dados = Helper.carregaDadosBanco()
            var noticiaIndice = await procurarNoticia(req.body.noticia)
            dados.noticias.splice(noticiaIndice, 1)
            let erroAoGravar = false
            await Helper.gravaDadosBanco(dados).then().catch((error)=> erroAoGravar = error)
            if (erroAoGravar){
                res.status(401).json({error: `Error ao gravar dados ${erroAoGravar}`})
            }
            else{
                res.status(200).json( {mensagem: 'Notícia apagada com sucesso'})
            }    
        }
    })
}

module.exports = {
    listarNoticias, incluirNoticia, apagarNoticia, alterarNoticia
}