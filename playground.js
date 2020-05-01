var express = require('express') 
var app = express()

var cors = require('cors')
app.use(cors())

const dotenv = require('dotenv')
dotenv.config()

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

/*const fileUpload = require('express-fileupload')
app.use(fileUpload())*/


/*app.post('/endpoint', async function (req, res, next) {
    console.log(req)
    res.status(200).json({ mensagem: 'File processed' })
})*/

const multer = require("multer")
app.post("/endpoint", multer().array("fileuploaded"), function (req, res) {
    console.log("body: ", req.body);
    console.log("files:", req.files);
    return res.sendStatus(200);
});


const chalk = require('chalk');
app.listen(process.env.PORT, () => { console.log(chalk.underline.blue('Server up and listening at ' + process.env.PORT))})
