var Particle = require('spark');
var EventEmitter = require('events');
var util = require('util');

var Belt = function(photon){
  console.log(photon);
  EventEmitter.call(this);
  this.photon = photon;
  this.colors = [];
  if(!this.photon.connected){
    this.offline();
  }

  this.refresh();
  setInterval(this.refresh.bind(this), 5000);
}

util.inherits(Belt, EventEmitter);

Belt.prototype.refresh = function(){
  this.photon.getVariable('colors', function(err, data){
    if(err){
      this.emit('error', err)
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
  this.emit('offline');
}

module.exports = Belt;

