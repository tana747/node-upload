var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/vod');
//Get conn the default connection
var conn = mongoose.connection;
const fileUpload = require('express-fileupload');

// Seting up server to accept cross-origin browser requests
app.use(function (req, res, next) { //allow cross origin requests
  res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
// default options fileUpload
app.use(fileUpload());

// API path that will upload the files
app.post('/upload', function (req, res) {
  console.log(req.files);
  if (!req.files)
      return res.status(400).send('No files were uploaded.');

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.file;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv('./uploads/'+req.files.file.name, function(err) {
      if (err)
        return res.status(500).send(err);

      res.json({uri:'/file/'+req.files.file.name});
    });
});


app.get('/file/:filename', function (req, res) {
  let files = req.params.filename;
  if (!files || files.length === 0) {
    return res
      .status(404)
      .json({responseCode: 1, responseMessage: "error"});
  }
  res.sendFile(__dirname+ '/uploads/'+files);

});
app.listen('3002', function () {
  console.log('running on 3002...');
});
