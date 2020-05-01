const chalk = require('chalk')
const fs = require('fs')

const importarPlanilha = async function (req, res) {
    console.log("files:", req.files);
    res.status(200).json({ mensagem: 'Planilha importada com sucesso' })
}

module.exports = {
    importarPlanilha
}
