var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/vod');
//Get conn the default connection
var conn = mongoose.connection;
const fileUpload = require('express-fileupload');
var Schema = mongoose.Schema;
var ContentSchema = new Schema({
  user: String,
  title: String,
  description: String,
  name: String,
  type: String,
  tag: String,
});
mongoose.model('Content', ContentSchema);
var Content = mongoose.model('Content');
//user collection
var UserSchema = new Schema({username: String, email: String,});
mongoose.model('User', UserSchema);
var User = mongoose.model('User');
// uuid
var nodeUuid = require('node-uuid');
var uuid = nodeUuid.v4();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// Seting up server to accept cross-origin browser requests
app.use(function (req, res, next) { //allow cross origin requests
  res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
  res.header("Access-Control-Allow-Origin", "http://localhost:3002");
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
app.post('/upload', function (req, res, next) {
  let sampleFile = req.files.file;
  var ext = getExtension(req.files.file.name);
  req.files.file.name = uuid + "." + ext;
  var type;
  console.log(req.body);
  if (!req.files)
    return res.status(400).send('No files were uploaded.');
  function getExtension(filename) {
    var parts = filename.split('.');
    return parts[parts.length - 1];
  }
  function isImage(filename) {
    var ext = getExtension(req.files.file.name);
    switch (ext.toLowerCase()) {
      case 'jpg':
      case 'gif':
      case 'bmp':
      case 'png':
        //etc
        return true;
    }
    return false;
  }
  function isVideo(filename) {
    var ext = getExtension(req.files.file.name);
    switch (ext.toLowerCase()) {
      case 'm4v':
      case 'avi':
      case 'mpg':
      case 'mp4':
        // etc
        return true;
    }
    return false;
  }
  if (isImage()) {
    type = 'image';
    sampleFile.mv('./uploadsImage/' + req.files.file.name, function (err) {
      if (err)
        return res.status(500).send(err);
      res.json({
        user: '' + req.body.user,
        title: '' + req.body.title,
        des: '' + req.body.des,
        type: '' + type,
        tag: '' + req.body.tag,
        uri: '/file/image/' + req.files.file.name
      });
    });
  }
  if (isVideo()) {
    type = 'video';
    sampleFile.mv('./uploadsVdo/' + req.files.file.name, function (err) {
      if (err)
        return res.status(500).send(err);
      res.json({
        user: '' + req.body.user,
        title: '' + req.body.title,
        des: '' + req.body.des,
        type: '' + type,
        tag: '' + req.body.tag,
        uri: '/file/video/' + req.files.file.name
      });
    });
  }
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  //let sampleFile = req.files.file;
  var ext = getExtension(req.files.file.name);
  req.files.file.name = uuid + "." + ext;
  // Use the mv() method to place the file somewhere on your server
  var content = new Content({
    user: req.body.user,
    title: req.body.title,
    description: req.body.des,
    name: req.files.file.name,
    type: type,
    tag: req.body.tag,
  });
  content.save();
  // sampleFile.mv('./uploads/' + req.files.file.name, function (err) {
  //   if (err)
  //     return res.status(500).send(err);
  //   res.json({
  //     title: '' + req.body.title,
  //     des: '' + req.body.des,
  //     uri: '/file/' + req.files.file.name,
  //   });
  // });
});
app.get('/file/image/:filename', function (req, res) {
  let files = req.params.filename;
  if (!files || files.length === 0) {
    return res
      .status(404)
      .json({responseCode: 1, responseMessage: "error",});
  }
  res.sendFile(__dirname + '/uploadsImage/' + files);
});
app.get('/file/video/:filename', function (req, res) {
  let files = req.params.filename;
  if (!files || files.length === 0) {
    return res
      .status(404)
      .json({responseCode: 1, responseMessage: "error",});
  }
  res.sendFile(__dirname + '/uploadsVdo/' + files);
});
//user
app.get('/user', function (req, res) {
  res.sendFile(__dirname + '/user.html');
});
app.post('/create', function (req, res, next) {
  console.log(req.body.username);
  var user = new User({username: req.body.username, email: req.body.email,});
  user.save(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});
app.get('/users', function (req, res, next) {
  console.log('======');
  User.find({}, function (err, users) {
    if (err) {
      return next(err);
    }
    //console.log(users);
    res.json(users);
  });
});
app.listen('3002', function () {
  console.log('running on 3002...');
});
