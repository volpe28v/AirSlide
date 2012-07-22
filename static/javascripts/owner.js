$(function() {
    var socket = new io.connect('/');
    socket.on('connect', function() {
      socket.emit('get_list');
      console.log('connect');
    });

    socket.on('get_list', function(list){
      console.log(list);

      for(var i = 0; i < list.length; i++){
        var thumb = $('<li/>').append($('<img/>').attr('src', "/data/" + list[i]));
        thumb.click(function(){
          var file_name = list[i];
          return function(){
            socket.emit('select_file',file_name);
            console.log(file_name);
          }
        }());
        $('#thumb-list').append(thumb);
      }
      $('#slider-code').tinycarousel({display: 2});
 
    });

    socket.on('select_file',function(file_name){
      console.log(file_name);
      var slide_img = $('<img/>').attr('src', "/data/" + file_name).attr('width',"600px");
      $('#slide').hide();
      $('#slide').empty();
      $('#slide').append(slide_img);
      $('#slide').fadeIn();
    });

    socket.on('disconnect', function(){
      console.log('disconnect');
    });

});
 
