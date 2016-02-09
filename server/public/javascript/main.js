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

  socket.on('update-belt', function(data){
    for(var i = 1; i < 8; i++){
      $('.js-belt-color' + i).css('background-color', $('.js-belt-color' + (i + 1)).css('background-color'));
    }
    $('.js-belt-color8').css('background-color', data.color);
  });

  socket.on('update-component', function(data){
    $('.js-jacket-color-' + data.component).css('background-color', data.color);
  })

  socket.on('refresh-belt', function(data){
    if(data.colors && data.colors[0]){  
      for(var i = 0; i < 8; i++){
        $('.js-belt-color' + (i + 1)).css('background-color', 'rgb(' + data.colors[i][0] + ',' + data.colors[i][1] + ',' + data.colors[i][2] + ')');
      }
    }
  });

  socket.on('refresh-jacket', function(data){
    console.log('jacket refresh');
    if(data.colors){
      $('.js-jacket-color-hood').css('background-color', 'rgb(' + data.colors[0][0] + ',' + data.colors[0][1] + ',' + data.colors[0][2] + ')');
      $('.js-jacket-color-left').css('background-color', 'rgb(' + data.colors[1][0] + ',' + data.colors[1][1] + ',' + data.colors[1][2] + ')');
      $('.js-jacket-color-right').css('background-color', 'rgb(' + data.colors[2][0] + ',' + data.colors[2][1] + ',' + data.colors[2][2] + ')');
      $('.js-jacket-color-button').css('background-color', 'rgb(' + data.colors[3][0] + ',' + data.colors[3][1] + ',' + data.colors[3][2] + ')');
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

  socket.on('jacket-offline', function(){
    console.log('jacket is offline');
    $('.js-jacket-offline').removeClass('hidden');
    form.find('option[value=hood]').attr('disabled', true);
    form.find('option[value=left]').attr('disabled', true);
    form.find('option[value=right]').attr('disabled', true);
    form.find('option[value=button]').attr('disabled', true);
  })


  socket.on('jacket-online', function(){
    console.log('jacket is online');
    $('.js-jacket-offline').addClass('hidden');
    form.find('option[value=hood]').attr('disabled', false);
    form.find('option[value=left]').attr('disabled', false);
    form.find('option[value=right]').attr('disabled', false);
    form.find('option[value=button]').attr('disabled', false);
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
    if(!inputColor.red && !inputColor.green && !inputColor.blue){
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