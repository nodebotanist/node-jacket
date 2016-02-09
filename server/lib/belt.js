var Particle = require('spark');
var EventEmitter = require('events');
var util = require('util');

var Belt = function(photon){
  EventEmitter.call(this);
  this.photon = photon;
  this.colors = [];
  if(!photon.connected){
    this.offline();
  } else {
    this.online();
  }
  this.statusInterval = setInterval(this.refresh.bind(this), 5000);
}

util.inherits(Belt, EventEmitter);

Belt.prototype.refresh = function(){
  this.photon.getVariable('colors', function(err, data){
    if(err){
      this.offline();
      return;
    } else if(!this.connected){
      this.online();
    }

    this.connected = true;
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
}

Belt.prototype.online = function(){
  this.connected = true;
  this.emit('online');
}

Belt.prototype.checkStatus = function(){
  this.photon.signal(function(err, data){
    if(err){
      return;
    }
    if(!this.connected){
      this.online();
    }
    this.photon.stopSignal();
  }.bind(this));
}

Belt.prototype.addColor = function(color, callback){
  this.photon.callFunction('addColor', color, function(err, data){
    callback(err);
  });
}

module.exports = Belt;

