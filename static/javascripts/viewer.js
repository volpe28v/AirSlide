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


  socket.on('mouse_pointer', function(pos) {
    updateCursolPosition($cursol, pos.x_per, pos.y_per);
  });

  socket.on('select_file',function(file_name){
    if ( file_name == "" ){ return; }

    var $slide_img = $('<img/>').attr('src', "/data/" + file_name).attr('id','slide-core');
    $('#slide-view').hide();
    $('#slide-view').empty();
    $('#slide-view').append($slide_img);
    $slide_img.width($(window).width() * 0.7);
    $cursol.hide();
    $('#slide-view').fadeIn('normal',function(){
      $('#slide-view').width($slide_img.width());
      $('#slide-view').height($slide_img.height());
      $('#slide-view').append($cursol);
      $cursol.fadeIn();
    });
  });

  socket.on('disconnect', function(){
  });

  var $cursol = $('<div/>').attr("id","viewer-pointer")
                           .css("display","none");

});

function updateCursolPosition($cursol, x_per, y_per){
  $cursol.css("top",$('#slide-core').height() * y_per / 1000)
         .css("left",$('#slide-core').width() * x_per / 1000);
}

