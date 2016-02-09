var dotenv = require('dotenv');
var particle = require('spark');
var _ = require('lodash');
var express = require('express');

var app = express();  
var server = require("http").Server(app);  
var io = require("socket.io")(server);

var Belt = require('./lib/belt');
var Jacket = require('./lib/jacket');

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
        io.emit('refresh-belt', {
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

      jacket = new Jacket(_.find(devices, {name: 'jacket2'}));
      
      jacket.on('refreshed', function(){
        console.log('server jacket refresh');
        io.emit('refresh-jacket', {
          colors: jacket.colors
        })
      });

      jacket.on('offline', function(){
        console.log('offline server');
        io.emit('jacket-offline');
      });

      jacket.on('online', function(){
        console.log('online server');
        io.emit('jacket-online');
      });

      io.on('connection', function (socket) {
        socket.on('newColor', function (data) {
          updateColors(data);
        });
        if(belt && belt.connected){
          socket.emit('refresh-belt', {
            colors: belt.colors
          });
        } else {
          socket.emit('belt-offline');
        }

        if(jacket && jacket.connected){
          socket.emit('refresh-jacket', {
            colors: jacket.colors
          });
        } else {
          socket.emit('jacket-offline');
        }
      });
    });
});

function updateColors(data){
  if(data.component == 'belt'){
    console.log(belt);
    belt.addColor(data.color.slice(1), function(err){
      if(err){
        io.emit('belt-error', err);
      } else {
        io.emit('update-belt', {
          color: data.color
        });
        belt.refresh();
      }
    });
  } else {
    jacket.setColor(data.component, data.color.slice(1), function(err){
      if(err){
        io.emit('jacket-error', err);
      } else {
        io.emit('update-component', data);
        jacket.refresh();
      }
    });
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
