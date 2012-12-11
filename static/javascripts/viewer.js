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
      $('#slide-view').fadeIn('normal',function(){
        $('#slide-view').width($('#slide-core').width());
        $('#slide-view').height($('#slide-core').height());
        $('#slide-view').append($cursol);
      });
    });

    socket.on('disconnect', function(){
    });

    var $cursol = $('<div/>').css("height",14)
                             .css("width",14)
                             .css("border-radius",7)
                             .css("background-color","red")
                             .css("position","absolute");
  //  $('#slide-view').append($cursol);
    $cursol.css("top",100)
           .css("left",200);

});

