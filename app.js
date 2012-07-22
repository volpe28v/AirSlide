var fs = require('fs');
var express = require('express');
var program = require('commander');
var app = require('./lib/server');
var io = require('socket.io').listen(app);

var default_db = 'airshare_db'
program
  .version('0.0.1')
  .option('-p, --port <n>', 'port no. default is 3008.')
  .option('-d, --db_name [name]', 'db name. default is "' + default_db + '".')
  .parse(process.argv);

var port = program.port || process.env.PORT || 3000;
console.log(' port : ' + port);

var db_name = program.db_name || default_db;
console.log(' db_name : ' + db_name);

app.get('/owner', function(req, res) {
    console.log('/owner');
    res.render('owner');
});

app.get('/viewer', function(req, res) {
    console.log('/viewer');
    res.render('viewer');
});

app.listen(port);

var current_file_name = "";
io.sockets.on('connection', function(client) {
    console.log("connection!!!");

    client.on('message', function(msg) {
        client.broadcast.emit('message', msg);
        console.log(msg);
    });

    client.on('get_list', function() {
      console.log('get_list');
      fs.readdir('./static/data',function(err, files){
        var valid_files = [];
        for (var i = 0; i < files.length; i++){
          if ( files[i].match(/^\./) ){ continue; }
          valid_files.push(files[i]);
        }
        client.emit('get_list', valid_files);
        console.log(files);
      });
    });
 
    client.on('select_file', function(file_name){
      current_file_name = file_name;
      client.emit('select_file', current_file_name);
      client.broadcast.emit('select_file', current_file_name);
    });

    client.on('get_select_file', function(){
      client.emit('select_file', current_file_name);
    });

    client.on('disconnect', function() {
        console.log('disconnect');
    });
});

console.log('Server running at http://127.0.0.1:' + port + '/');

