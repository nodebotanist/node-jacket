$(function(){
  var socket = io('http://localhost:3000');

  socket.on('connect', function(){
    console.log('socket connected!');
  });

  socket.on('connect_error', function(){
    $('.js-socket-error').removeClass('hidden');
  });

  socket.on('reconnect_error', function(){
    $('.js-socket-error').removeClass('hidden');
  });

  socket.on('reconnect_fail', function(){
    $('.js-socket-error').removeClass('hidden');
  });

  socket.on('updateBelt', function(data){
    for(var i = 1; i < 8; i++){
      $('.js-belt-color' + i).css('background-color', $('.js-belt-color' + (i + 1)).css('background-color'));
    }
    $('.js-belt-color8').css('background-color', data.color);
  });

  socket.on('refreshBelt', function(data){
    for(var i = 0; i < 8; i++){
      $('.js-belt-color' + (i + 1)).css('background-color', 'rgb(' + data.colors[i][0] + ',' + data.colors[i][1] + ',' + data.colors[i][2] + ')');
    }
  });

  socket.on('belt-offline', function(){
    console.log('belt is offline');
    $('.js-belt-offline').removeClass('hidden');
    form.find('option[value=belt]').attr('disabled', true);
  })


  socket.on('belt-online', function(){
    console.log('belt is online');
    $('.js-belt-offline').addClass('hidden');
    form.find('option[value=belt]').attr('disabled', false);
  })

  var Color = net.brehaut.Color;
  var form = $('form');

  form.find('.js-set-color').on('click', function(event){
    event.preventDefault();
    var inputColor = Color(form.find('[name=color]').val());
    var component = form.find('[name=component]').val();
    ready = true;

    if(!component){
      $('.js-no-component').removeClass('hidden');
      ready = false;
    }
    if(!inputColor.red){
      $('.js-no-color').removeClass('hidden');
      ready = false;
    }
    if(ready){
      $('.js-no-color').addClass('hidden');
      $('.js-no-component').addClass('hidden');
      console.log(inputColor.toCSS(), component);
      socket.emit('newColor', {
        color: inputColor.toCSS(),
        component: form.find('[name=component]').val()
      })
    }
  });



})