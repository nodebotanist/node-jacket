var dotenv = require('dotenv');
var particle = require('spark');
var _ = require('lodash');
var express = require('express');

var app = express();  
var server = require("http").Server(app);  
var io = require("socket.io")(server);

dotenv.load();

var jacketPhoton, beltPhoton;

var beltColors;

particle.on('login', function(err, body){
    if(err){
      throw err;
    } 

    startServer();

    particle.listDevices(function(err, devices){
      jacketPhoton = _.find(devices, {name: 'jacket2'});
      beltPhoton = _.find(devices, {name: 'belt'});

      setInterval(function(){
        beltPhoton.getVariable('colors', function(err, data){
          console.log(data)
        })
      }, 5000)
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

io.on('connection', function (socket) {
  socket.on('newColor', function (data) {
    updateColors(data);
  });
});


particle.login({
  accessToken: process.env.PARTICLE_ACCESS_TOKEN
});

function startServer(){
  server.listen(3000, function () {
    console.log('Example app listening on port 3000!');
  });  
}
