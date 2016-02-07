var Particle = require('spark');
var EventEmitter = require('events');
var util = require('util');

var statusInterval;

var Belt = function(photon){
  console.log(photon);
  EventEmitter.call(this);
  this.photon = photon;
  this.colors = [];
  if(!this.photon.connected){
    this.offline();
  } else {
    this.refresh();
  }
}

util.inherits(Belt, EventEmitter);

Belt.prototype.refresh = function(){
  console.log('refreshing');
  this.photon.getVariable('colors', function(err, data){
    if(err){
      this.offline();
      return;
    }

    this.colors = [];
    var parsedColor;
    colors = data.result.split('|');
    colors.forEach(function(color, index){
      parsedColor = color.split(',');
      this.colors.push(parsedColor);
    }.bind(this));
  }.bind(this));
  this.emit('refreshed');
}

Belt.prototype.offline = function(){
  this.connected = false;
  this.emit('offline');
  if(statusInterval){
    clearInterval(statusInterval);
  }
  statusInterval = setInterval(this.checkStatus.bind(this), 5000);
}

Belt.prototype.online = function(){
  this.connected = true;
  this.emit('online');

  if(statusInterval){
    clearInterval(statusInterval);
    statusInterval = setInterval(this.refresh.bind(this), 5000);
  }
}

Belt.prototype.checkStatus = function(){
  console.log('checking status');
  this.photon.signal(function(err, data){
    if(err){
      return;
    }
    this.online();
    this.photon.stopSignal();
  }.bind(this));
}

module.exports = Belt;

