var slideList = function(){
  var file_list = null;
  var current_no = 0;

  return {
    set: function(list){
      file_list = list;
    },
    current: function(){
      return file_list[current_no];
    },
    set_current: function(no){
      current_no = no;
    }
  };
}();

$(function() {
    var socket = new io.connect('/');
    socket.on('connect', function() {
      socket.emit('get_list');
      console.log('connect');
    });

    socket.on('get_list', function(list){
      console.log(list);
      slideList.set(list);

      socket.emit('select_file',slideList.current());

      for(var i = 0; i < list.length; i++){
        var thumb = $('<li/>').append($('<img/>').attr('src', "/data/" + list[i]));
        thumb.click(function(){
          var no = i;
          return function(){
            slideList.set_current(no);
            socket.emit('select_file',slideList.current());
            console.log(slideList.current());
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
 
