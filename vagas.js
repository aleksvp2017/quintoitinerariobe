const chalk = require('chalk')
var fs = require('fs')
var XLSX = require('xlsx')
const { Pool } = require('pg')
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})
const Planilha = require('./planilha.js')


const importarPlanilha = async function (req, res) {
  try{
    let {linhas, cabecalho} = await carregarLinhasPlanilha(req)   
    console.log('Dados carregados')
    const sqlInsert = montarInsert(cabecalho)
    linhas.map(async (linha) => {
      await pool.query(sqlInsert, linha)
    })
    res.status(200).json({ message: "Dados carregados com sucesso" })
  }
  catch (error){
    res.status(401).json({ error })
  }
}

const montarInsert = (colunas) => {
  return "insert into vaga (" + colunas.join(',').toLowerCase() + ") values(" + montarValues(colunas.length) + ")"; 
}

const montarValues = (tamanho) => {
  values = ""
  for (i=1; i<= tamanho; i++){
    values += "$"+ i + "," 
  }
  return values.substring(0, values.length-1)
}

const validarCabecalho = (cabecalho) => {
  Planilha.estrutura.colunasObrigatorias.map((coluna) => {
    if (!cabecalho.find(elemento => elemento === coluna)){
      throw 'Coluna ' + coluna + ' não encontrada.'
    }
  })
}

const validarLinhas = (cabecalho, linhas) => {
  linhas.map((linha) => {
    linha.map((celula, posicao) => {
      var coluna = Planilha.estrutura.colunas[cabecalho[posicao]]
      if (coluna){
        console.log('Validando coluna ', coluna)
        let msgValidacao = coluna.validar(celula)
        if (msgValidacao){
          throw msgValidacao
        }
      }
    })
  })
}

async function carregarLinhasPlanilha(req) {  
    const streamifier = require('streamifier')
    if (req.files.length <= 0){
      throw 'Nenhum arquivo encontrado'
    }
    var stream = streamifier.createReadStream(req.files[0].buffer)
    var workbook = await transformStreamInWorkbook(stream)
    var planilha = workbook.Sheets[Planilha.estrutura.nome]
    if (planilha == null){
      throw 'Nome da página / aba da planilha deve ser ' + Planilha.estrutura.nome
    }
    var matrizDados = XLSX.utils.sheet_to_json(planilha, { header: 1, raw: true })
    var cabecalho = matrizDados[0]
    validarCabecalho(cabecalho)
    var linhas = []  
    matrizDados.map((colunas, linha) => {
      let valor = []
      if (linha > 0) {
        colunas.map((celula, indicecoluna) => {
          valor[indicecoluna] = celula
        })
        linhas.push(valor)
      }
    })
    validarLinhas(cabecalho, linhas)
  return {linhas, cabecalho}
}

async function transformStreamInWorkbook(stream){
    var buffers = [];
    stream.on('data', function(data) { buffers.push(data); });
    var workbook = null
    await stream.on('end', function() {
      var buffer = Buffer.concat(buffers);
      workbook = XLSX.read(buffer, {type:"buffer"});
    });
    return workbook
  }
  

module.exports = {
    importarPlanilha
}
