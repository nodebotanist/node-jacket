var util = require('util');
var EventEmitter = require('events');

function Jacket(photon){
  console.log('jacket construction', photon)
  EventEmitter.call(this);
  this.photon = photon;
  if(!photon.connected){
    console.log('initial jacket offline');
    this.offline();
  } else {
    console.log('initial jacket online');
    this.online();
  }
  this.statusInterval = setInterval(this.refresh.bind(this), 5000);
}

util.inherits(Jacket, EventEmitter);


Jacket.prototype.refresh = function(){
  console.log('jacket refreshing');
  this.photon.getVariable('colors', function(err, data){
    if(err){
      console.log('jacket not responding', err);
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

Jacket.prototype.offline = function(){
  this.connected = false;
  this.emit('offline');
  console.log('jacket offline');
}

Jacket.prototype.online = function(){
  this.connected = true;
  this.emit('online');
  console.log('jacket online');
}

Jacket.prototype.checkStatus = function(){
  console.log('jacket checking status');
  this.photon.signal(function(err, data){
    if(err){
      console.log('check status error: ', err);
      return;
    }
    if(!this.connected){
      this.online();
    }
    this.photon.stopSignal();
  }.bind(this));
}

Jacket.prototype.setColor = function(component, color, callback){
  this.photon.callFunction('setColor', component + '|' + color, function(err, data){
    callback(err);
  });
}

module.exports = Jacket;