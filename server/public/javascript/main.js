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
    console.log(data);
  })

  var Color = net.brehaut.Color;
  var form = $('form');

  form.find('.js-set-color').on('click', function(event){
    event.preventDefault();
    var inputColor = Color(form.find('[name=color]').val());

    if(!inputColor.red){
      $('.js-no-color').removeClass('hidden');
    } else {
      console.log(inputColor.toCSS(), form.find('[name=component]').val());
      socket.emit('newColor', {
        color: inputColor.toCSS(),
        component: form.find('[name=component]').val()
      })
    }
  });



})