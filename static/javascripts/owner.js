var slideList = function(){
  var dir_name = null;
  var file_list = null;
  var current_no = 0;

  return {
    set: function(slide_data){
      current_no = 0;
      file_list = slide_data.list;
      dir_name = slide_data.dir;
    },
    current: function(){
      return dir_name + "/" + file_list[current_no];
    },
    set_current: function(no){
      current_no = no;
    },
    get_by: function(no){
      return dir_name + "/" + file_list[no];
    },
    next: function(){
      current_no++;
      if ( current_no >= file_list.length ){ current_no = file_list.length - 1; }
      return this.current();
    },
    prev: function(){
      current_no--;
      if ( current_no < 0 ){ current_no = 0; }
      return this.current();
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
      slideList.set(slide_data);

      $('#thumb-list').empty();
      for(var i = 0; i < list.length; i++){
        var thumb = $('<li/>').append($('<img/>').attr('src', "/data/" + slideList.get_by(i)).addClass("thumb").addClass('pointer-item'));
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

});
 
