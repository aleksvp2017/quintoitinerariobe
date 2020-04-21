# quintoitinerariobe
Back end do projeto quinto itinerário feito em node, acessando json-server, bem simples

#instala json-server, que fará papel de BD

npm install -g json-server

#sobe json-server (sugere-se roda num diretório diferente), por default sobe na porta 3000

json-server --watch db.json

#instalar dependencias (na raiz do diretório clocado)

npm install

#editar o .env na raiz para incluir secret para geração do token, email do faleconosco e secret do provedor de email
 
#para rodar o servidor, na raiz, por default sobe na porta 3001

nodemon app.js
