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
    updateCursolPosition(pos.x_per, pos.y_per);
  });

  socket.on('select_file',function(file_name){
    if ( file_name == "" ){ return; }

    var $slide_img = $('<img/>').attr('src', "/data/" + file_name).attr('id','slide-core');
    $('#slide-view').hide();
    $('#slide-view').empty();
    $('#slide-view').append($slide_img);
    $slide_img.width($(window).width() * 0.8);
    $cursol.hide();
    $('#slide-view').fadeIn('normal',function(){
      $('#slide-view').width($slide_img.width());
      $('#slide-view').height($slide_img.height());
      $('#slide-view').append($cursol);
    });
  });

  socket.on('disconnect', function(){
  });

  var $cursol = $('<div/>').attr("id","viewer-pointer")
                           .css("top", -1)
                           .css("left", -1)
                           .css("display","none");

  function updateCursolPosition(x_per, y_per){
    if ( x_per == -1 ){
      $cursol.fadeOut("slow");
      return;
    }

    $cursol.css("top",$('#slide-core').height() * y_per / 1000)
           .css("left",$('#slide-core').width() * x_per / 1000);
    if ( $cursol.css("display") == "none" ){
      $cursol.fadeIn("slow");
    }
  }

  var resize_timer = 0;
  $(window).resize(function(){
    if ( resize_timer != 0 ){
      clearTimeout(resize_timer);
    }

    resize_timer = setTimeout(function(){
      // ２回投げないと上手く拡大されない
      socket.emit('get_select_file');
      socket.emit('get_select_file');
    }, 500);
  });
});


