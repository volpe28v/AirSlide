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

var connect_num = 0;
var current_file_name = "";
var current_dir_name = "";
io.sockets.on('connection', function(client) {
    console.log("connection!!!");
    connect_num++;

    client.emit('connect_num', connect_num);
    client.broadcast.emit('connect_num', connect_num);
 
    client.on('message', function(msg) {
        client.broadcast.emit('message', msg);
        console.log(msg);
    });

    var get_current_list = function(call_back){
       if ( current_dir_name == ""){return};
      console.log('get_list');
      fs.readdir('./static/data/' + current_dir_name ,function(err, files){
        if (files == null){return};

        var valid_files = [];
        for (var i = 0; i < files.length; i++){
          if ( files[i].match(/^\./) ){ continue; }
          valid_files.push(files[i]);
        }

        var sorted_valid_files = valid_files.sort();
        var slide_data = { dir:current_dir_name, list:sorted_valid_files};
        call_back(slide_data);
      });
    };
        
    client.on('get_list', function() {
      get_current_list(function(slide_data){
        client.emit('get_list', slide_data);
      });
    });
 
    client.on('select_dir', function(dir_name) {
      console.log('select_dir');
      current_dir_name = dir_name;
      get_current_list(function(slide_data){
        client.emit('get_list', slide_data);
        client.broadcast.emit('get_list', slide_data);
      });
    });
 
    client.on('get_dir_list', function() {
      console.log('get_dir_list');
      fs.readdir('./static/data',function(err, files){
        var valid_files = [];
        for (var i = 0; i < files.length; i++){
          if ( files[i].match(/^\./) ){ continue; }
          valid_files.push(files[i]);
        }
        client.emit('get_dir_list', valid_files.sort());
        console.log(files);
      });
    });
 
    client.on('select_file', function(file_name){
      current_file_name = file_name;
      client.emit('select_file', current_file_name);
      client.broadcast.emit('select_file', current_file_name);
    });

    client.on('get_select_file', function(){
      if ( current_file_name == ""){return};
      client.emit('select_file', current_file_name);
    });

    client.on('disconnect', function() {
        console.log('disconnect');
        connect_num--;
        client.emit('connect_num', connect_num);
        client.broadcast.emit('connect_num', connect_num);
    });
});

console.log('Server running at http://127.0.0.1:' + port + '/');

