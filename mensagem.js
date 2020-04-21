var Helper = require('./helper.js')

const enviar = async function (req, res, next) {
    Helper.enviarEmail(req.body.assunto, req.body.mensagem, req.body.destinatario).then((mensagem) => {
        res.status(200).json({ mensagem })
    }).catch(error => {
        console.log(error)
        res.status(401).json({ error: `Error ao enviar mensagem ${error}` })
    })
}

module.exports = {
    enviar
}
