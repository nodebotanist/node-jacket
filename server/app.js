var dotenv = require('dotenv');
var particle = require('spark');
var _ = require('lodash');
var express = require('express');

var app = express();  
var server = require("http").Server(app);  
var io = require("socket.io")(server);

var Belt = require('./lib/belt');

dotenv.load();

var belt, jacket;

particle.on('login', function(err, body){
    if(err){
      throw err;
    } 

    startServer();

    particle.listDevices(function(err, devices){
      belt = new Belt(_.find(devices, {name: 'belt'}));
      
      belt.on('refreshed', function(){
        io.emit('refreshBelt', {
          colors: belt.colors
        })
      });

      belt.on('offline', function(){
        console.log('offline server');
        io.emit('belt-offline');
      });

      belt.on('online', function(){
        console.log('online server');
        io.emit('belt-online');
      });

      io.on('connection', function (socket) {
        socket.on('newColor', function (data) {
          updateColors(data);
        });
        socket.emit('refreshBelt', {
          colors: belt.colors
        });
      });
    });
});

function updateColors(data){
  if(data.component == 'belt'){
    beltPhoton.callFunction('addColor', data.color.slice(1));
    io.emit('updateBelt', {
      color: data.color
    });
  } else {
    jacketPhoton.callFunction(setColor, data.component + '|' + data.color.slice(1));
    io.emit('updateComponent', data);
  }
}

app.use(express.static('public'));

// app.get('/', function (req, res) {
//   res.send('Hello World!');
// });




particle.login({
  accessToken: process.env.PARTICLE_ACCESS_TOKEN
});

function startServer(){
  server.listen(3000, function () {
    console.log('Example app listening on port 3000!');
  });  
}
