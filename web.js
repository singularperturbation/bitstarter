var express = require('express');
var buffer = new Buffer(500);

var app = express.createServer(express.logger());
var fs = require('fs');
var path = require('path');
var fd = fs.openSync(path.join(process.cwd(), 'index.html'),'r');
var length = fs.readSync(fd,buffer,500);
app.get('/', function(request, response) {
  response.send(buffer.toString('ascii',0,length));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
