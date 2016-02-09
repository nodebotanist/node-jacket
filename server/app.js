var dotenv = require('dotenv');
var particle = require('spark');
var _ = require('lodash');
var express = require('express');
var twit = require('twitter');
var util = require('util');
var request = require('request');
var parse = require('parse-color');

var app = express();  
var server = require("http").Server(app);  
var io = require("socket.io")(server);

var Belt = require('./lib/belt');
var Jacket = require('./lib/jacket');

dotenv.load();

var belt, jacket;

var twitter_api = new twit({
  consumer_key: process.env.TWITTER_CONSUMER,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS,
  access_token_secret: process.env.TWITTER_ACCESS_SECRET
});

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
        io.emit('belt-offline');
      });

      belt.on('online', function(){
        io.emit('belt-online');
      });

      jacket = new Jacket(_.find(devices, {name: 'jacket2'}));
      
      jacket.on('refreshed', function(){
        io.emit('refresh-jacket', {
          colors: jacket.colors
        })
      });

      jacket.on('offline', function(){
        io.emit('jacket-offline');
      });

      jacket.on('online', function(){
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

var tweets_shown = [];

var css_colors = ["aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black", "blanchedalmond", "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgrey", "darkgreen", "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen", "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick", "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod", "gray", "grey", "green", "greenyellow", "honeydew", "hotpink", "indianred ", "indigo ", "ivory", "khaki", "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgrey", "lightgreen", "lightpink", "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray", "lightslategrey", "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin", "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "purple", "red", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray", "slategrey", "snow", "springgreen", "steelblue", "tan", "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow", "yellowgreen"];

function getNewHashtagTweets(){
  console.log('checking tweets');
  twitter_api.get('search/tweets.json', { q: '#NodeSash' }, function(err, tweets, resp){
  //   console.log(err, tweets);

    var newTweets = tweets.statuses;

    newTweets.forEach(function(tweet){
      if(new Date(tweet.created_at).getTime() > (new Date().getTime() - 40000)){
        if(tweets_shown.indexOf(tweet.id) == -1){
          tweets_shown.push(tweet.id);
          color = tweet.text.match(/#[a-f0-9]{6}/i);
          if(!color) color = tweet.text.match(/#[a-f0-9]{3}/i);
          if(!color) color = tweet.text.match(/hsl\([\d.]+,\s*([\d.]+)%,\s*([\d.]+)%\)/i)
          if(!color) color = tweet.text.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/i);

          if(color){
            color = parse(color[0].toLowerCase()).hex;
            if(color){
              belt.addColor(color.slice(1), function(err){
                if(err){
                  io.emit('belt-error', err);
                } else {
                  io.emit('update-belt', {
                    color: data.color
                  });
                  belt.refresh();
                }
              });
            }
          } else {
            var words = _.words(tweet.text);
            words = _.map(words, function(word){
              return word.toLowerCase();
            });
            var colorsInSentence = _.intersection(words, css_colors);
            if(colorsInSentence.length >= 1){
              color = parse(colorsInSentence[0]).hex;
              belt.addColor(color.slice(1), function(err){
                if(err){
                  io.emit('belt-error', err);
                } else {
                  io.emit('update-belt', {
                    color: data.color
                  });
                  belt.refresh();
                }
              });
            }
          }
        } 
      }
    });
  });
}

setInterval(getNewHashtagTweets, 5000);
setInterval(function(){
  tweets_shown.shift();
}, 40000);

particle.login({
  accessToken: process.env.PARTICLE_ACCESS_TOKEN
});

function startServer(){
  server.listen(3000, function () {
    console.log('Example app listening on port 3000!');
  });  
}
