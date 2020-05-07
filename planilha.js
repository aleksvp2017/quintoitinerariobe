const estrutura = {
    nome: 'Vagas',
    colunasObrigatorias: ['ANO'],
    colunas: {
      ANO: {
        nome: 'ANO',
        validar(valor){
          if (!Number.isInteger(valor)){
              return 'Coluna ' + this.nome + ' deve ser um número inteiro'
          }
        }
      },
      SALDO: {
        nome: 'ANO',
        validar(valor){
            if (!Number.isInteger(valor)){
                return 'Coluna ' + this.nome + ' deve ser um número inteiro'
            }
        }
      },
      VALORAPROVADO: {
        nome: 'ANO',
        validar(valor){
            if (!Number.isInteger(valor)){
                return 'Coluna ' + this.nome + ' deve ser um número inteiro'
            }
        }
      },
      APROVADA: {
        nome: 'ANO',
        validar(valor){
          if (!Number.isInteger(valor)){
              return 'Coluna ' + this.nome + ' deve ser um número inteiro'
          }
        }
      },
      HOMOLOGADA: {
        nome: 'ANO',
        validar(valor){
            if (!Number.isInteger(valor)){
                return 'Coluna ' + this.nome + ' deve ser um número inteiro'
            }
        }
      },
      MATRICULAREALIZADA: {
        nome: 'ANO',
        validar(valor){
            if (!Number.isInteger(valor)){
                return 'Coluna ' + this.nome + ' deve ser um número inteiro'
            }
        }
      },
      MODALIDADE: {
        nome: 'MODALIDADE',
        validar(valor){
            if (valor != 'Técnico Presencial' && valor != 'Técnico EaD' && valor != 'FIC Presencial' && valor != 'FIC EaD') {
                return 'Coluna ' + this.nome + ' deve ter um dos seguintes valores: Técnico Presencial, Técnico EaD, FIC Presencial, FIC EaD'
            }
        }
      },
      TIPO: {
        nome: 'TIPO',
        validar(valor){
          if (valor != 'R' && valor != 'N') {
              return 'Coluna ' + this.nome + ' deve ter valor R ou N'
          }
        }
      },
    }
  }

  module.exports = {
      estrutura
  }