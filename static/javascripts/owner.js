var slideList = function(){
  var dir_name = null;
  var file_list = null;
  var current_no = 0;
  var move_action_handler = null;
  var select_action_handler = null;

  return {
    set: function(slide_data, move_handler, select_handler){
      current_no = 0;
      file_list = slide_data.list;
      dir_name = slide_data.dir;
      move_action_handler = move_handler;
      select_action_handler = select_handler;
    },
    current: function(){
      return dir_name + "/" + file_list[current_no];
    },
    set_current: function(no){
      current_no = no;
      if ( current_no < 0 ){ current_no = 0; }
      if ( current_no >= file_list.length ){ current_no = file_list.length - 1; }

      select_action_handler(current_no);
    },
    get_by: function(no){
      return dir_name + "/" + file_list[no];
    },
    next: function(){
      this.set_current(current_no + 1);

      this._call_action_handler();
      return this.current();
    },
    prev: function(){
      this.set_current(current_no - 1);

      this._call_action_handler();
      return this.current();
    },
    _call_action_handler: function(){
      var start_pos = current_no + 1;
      if ( start_pos > file_list.length - 4 ){ start_pos = file_list.length - 4; }
      move_action_handler(start_pos);
    }
  };
}();

$(function() {
    var socket = new io.connect('/');
    socket.on('connect', function() {
      socket.emit('get_select_file');
      socket.emit('get_dir_list');
      socket.emit('get_list');
    });

    socket.on('connect_num', function(num) {
      var person_symbol = "";
      for(var i = 0; i < num; i++){
        person_symbol += "λ";
      }

      $("#connect_num").html(person_symbol);
    });

    socket.on('get_dir_list', function(list){
      $('#dir-list').empty();
      for(var i = 0; i < list.length; i++){
        var dir_item = $('<li/>').append($('<a/>').addClass('pointer-item').text(list[i]));
        $('#dir-list').append(dir_item);

        dir_item.click(function(){
          var dir_name = list[i];
          return function(){
            socket.emit('select_dir',dir_name);
          }
        }());
      }
    });

    socket.on('get_list', function(slide_data){
      var list = slide_data.list;
      slideList.set(slide_data,
        function(no){ // move_handler
          $('#slider-code').tinycarousel_move(no);
        },
        function(no){ // select_hander
          $('.thumb').addClass("normal-thumb");
          $('.thumb').removeClass("current-thumb");
          $('#thumb_' + no).addClass("current-thumb");
        }
      );

      $('#thumb-list').empty();
      for(var i = 0; i < list.length; i++){
        var thumb = $('<li/>').append($('<img/>').attr('src', "/data/" + slideList.get_by(i)).attr('id',"thumb_" + i).addClass("thumb normal-thumb").addClass("pointer-item"));
        thumb.click(function(){
          var no = i;
          return function(){
            slideList.set_current(no);
            socket.emit('select_file',slideList.current());
          }
        }());
        $('#thumb-list').append(thumb);
      }
      $('#slider-code').tinycarousel({display: 1, duration: 500});
    });

    socket.on('select_file',function(file_name){
      var slide_img = $('<img/>').attr('src', "/data/" + file_name).attr('id',"slide-preview").addClass('pointer-item');
      $('#slide').hide();
      $('#slide').empty();
      $('#slide').append(slide_img);
      $('#slide').fadeIn();

//      console.log(file_name);
    });

    socket.on('disconnect', function(){
    });

    $('#slide').click(function(){
      socket.emit('select_file',slideList.next());
    });

    $('#slide-prev').click(function(){
      socket.emit('select_file',slideList.prev());
    });

    $('#slide-next').click(function(){
      socket.emit('select_file',slideList.next());
    });

    $('#slide').mousemove(function(e){
      var x = parseInt(e.pageX - $(this).position().left);
      var y = parseInt(e.pageY - $(this).position().top);
      var width_per = parseInt(x / $(this).width() * 100);
      var height_per= parseInt(y / $(this).height() * 100);
      $('#mouse_result').text( "x: " + x + " y: " + y + "  w: " + width_per + "% h: " + height_per + "%");
    });
});
