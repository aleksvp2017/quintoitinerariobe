var Helper = require('./helper.js')
const chalk = require('chalk')
const { Pool } = require('pg')
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const listarNoticias = async (req, res) => {
    //await sleep(20000).then(() => { console.log("teste atraso!"); });
    var jwt = require('jsonwebtoken')
    jwt.verify(req.token, process.env.SECRET, async (err, decoded) => {
        if (err) {
            Helper.enviaErroAdequado(err, res)
        }
        else {
            try{
                let noticias = await (await pool.query('select * from noticia order by datapublicacao desc')).rows
                res.status(200).json({ noticias })
            }
            catch(error){
                console.log(chalk.red('erro ao buscar notícias', error))
            }              
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
            try{
                let noticia = req.body.noticia
                //Tem que ter o RETURNING * para dizer que quero a linha recém inserida como retorno
                let result = await pool.query('insert into noticia (titulo, conteudo) values ($1, $2) RETURNING *', [noticia.titulo, noticia.conteudo])
                noticia = result.rows[0]
                res.status(200).json( {message: 'Notícia registrada com sucesso', noticia})                    
            }
            catch (error){
                res.status(401).json({error: `Error ao gravar dados ${error}`})

            }    
        }
    })
}

const alterarNoticia =  async (req, res) => {
    var jwt = require('jsonwebtoken')
    jwt.verify(req.token, process.env.SECRET, async (err, decoded) => {
        if (err){
            Helper.enviaErroAdequado(err, res)
        }
        else{
            try{
                let result = await pool.query('update noticia set titulo = $1, conteudo = $2 where noticiaid = $3 returning *', 
                    [req.body.noticia.titulo, req.body.noticia.conteudo, req.body.noticia.noticiaid])
                let noticia = result.rows[0]
                console.log(noticia)
                res.status(200).json( {message: 'Notícia alterada com sucesso', noticia})    
            }
            catch (error){
                res.status(401).json({error: `Error ao gravar dados ${error}`})
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
            try{
                await pool.query('delete from noticia where noticiaid = $1', 
                    [req.params.id])
                res.status(200).json( {message: 'Notícia excluída com sucesso'})    
            }
            catch (error){
                res.status(401).json({error: `Error ao excluir notícia ${error}`})
            } 
        }
    })
}

module.exports = {
    listarNoticias, incluirNoticia, apagarNoticia, alterarNoticia
}