var express = require('express') 
var app = express()

var cors = require('cors')
app.use(cors())

const multer = require("multer")
app.post("/endpoint", multer().array("fileuploaded"), function (req, res) {
    console.log("files:", req.files);
    const streamifier = require('streamifier');
    var stream = streamifier.createReadStream(req.files[0].buffer)
    process_RS(stream, (workbook) => console.log(workbook))
    res.status(200).json({ mensagem: 'Planilha importada com sucesso' })    
    return res.sendStatus(200);
});

app.listen(process.env.PORT, () => { console.log('Server up and listening at ' + process.env.PORT)})


function process_RS(stream/*:ReadStream*/, cb/*:(wb:Workbook)=>void*/)/*:void*/{
    var buffers = [];
    stream.on('data', function(data) { buffers.push(data); });
    stream.on('end', function() {
      var buffer = Buffer.concat(buffers);
      var workbook = XLSX.read(buffer, {type:"buffer"});
   
      /* DO SOMETHING WITH workbook IN THE CALLBACK */
      cb(workbook);
    });
  }
