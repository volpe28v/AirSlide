$(function() {
    var socket = new io.connect('/');
    socket.on('connect', function() {
      socket.emit('get_select_file');
      console.log('connect');
    });

    socket.on('select_file',function(file_name){
      console.log(file_name);
      if ( file_name == "" ){ return; }

      var slide_img = $('<img/>').attr('src', "/data/" + file_name).attr('width',"80%");
      $('#slide').hide();
      $('#slide').empty();
      $('#slide').append(slide_img);
      $('#slide').fadeIn();
    });

    socket.on('disconnect', function(){
      console.log('disconnect');
    });

});
 
