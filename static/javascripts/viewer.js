$(function() {
    var socket = new io.connect('/');
    socket.on('connect', function() {
      socket.emit('get_select_file');
    });

    socket.on('connect_num', function(num) {
      var person_symbol = "";
      for(var i = 0; i < num; i++){
        person_symbol += "λ";
      }

      $("#connect_num").html(person_symbol);
    });

    socket.on('select_file',function(file_name){
      if ( file_name == "" ){ return; }

      var slide_img = $('<img/>').attr('src', "/data/" + file_name).attr('id','slide-core');
      $('#slide-view').hide();
      $('#slide-view').empty();
      $('#slide-view').append(slide_img);
      $('#slide-view').fadeIn();
    });

    socket.on('disconnect', function(){
    });
});
 
