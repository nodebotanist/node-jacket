var util = require('util');
var EventEmitter = require('events');

function Jacket(photon){
  EventEmitter.call(this);
  this.photon = photon;
}

module.exports = Jacket;