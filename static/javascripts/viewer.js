var slideList = null;
var slideListJpg = function(){
  var file_name = "";

  return {
    set: function(file_info, call_back){
      file_name = file_info.name;
      call_back();
    },
    get_core_dom: function(){
      return $('<img/>').attr('src', "/data/" + file_name);
    }
  };
}();

var slideListPdf = function(){
  var file_name = "";
  var file_length = 0;
  var page_list = [];
  var current_no = 0;

  return {
    set: function(file_info, call_back){
      current_no = file_info.no;
      if (file_name == file_info.name){
        call_back();
      }else{
        file_name = file_info.name;
        page_list = [];

        PDFJS.disableWorker = true;
        PDFJS.getDocument("/data/" + file_name).then(function(pdf) {
          file_length = pdf.numPages;

          function push_page(pdf, page_number, call_back){
            pdf.getPage(page_number).then(function(page) {
              page_list.push(page);
              call_back();
            });
          }

          var page_number = 1;
          push_page(pdf, page_number++, function push_page_complete(){
            if (page_number > pdf.numPages){
              call_back();
              console.log("complete psuh_page");
              return;
            }

            push_page(pdf, page_number++, push_page_complete);
          });
        });
      }
    },
    get_core_dom: function(){
      var page = page_list[current_no];
      var scale = 1.5;
      var viewport = page.getViewport(scale);
      var canvas = $('<canvas>');
      var context = canvas.get(0).getContext('2d');
      canvas.attr('height', viewport.height);
      canvas.attr('width', viewport.width);

      page.render({canvasContext: context, viewport: viewport});
      return canvas;
    }
  };
}();


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

  socket.on('select_file',function(file_info){
    if ( file_info.name == "" ){ return; }
    if ( file_info.type == "jpg" ){
      slideList = slideListJpg;
    } else if ( file_info.type == "pdf" ){
      console.log("get_list for pdf");
      slideList = slideListPdf;
    }
    slideList.set(file_info, function(){
      var $slide_img = slideList.get_core_dom().attr('id','slide-core');
      $('#slide-view').hide();
      $('#slide-view').empty();
      $('#slide-view').append($slide_img);
      $slide_img.width($(window).width() * 0.8);

      $('#slide-view').fadeIn('normal',function(){
        $('#slide-view').width($slide_img.width());
        $('#slide-view').height($slide_img.height());
        $('#slide-view').append($cursor);
        $cursor.hide();
      });
    });
  });

  socket.on('disconnect', function(){
  });

  var $cursor = $('<div/>').attr("id","viewer-pointer")
                           .css("top", -1)
                           .css("left", -1)
                           .css("display","none");

  function updateCursolPosition(x_per, y_per){
    if ( x_per < 0 || y_per < 0){
      $cursor.fadeOut("slow");
      return;
    }

    var top_pos  = ($('#slide-core').height() * y_per / 1000) - $cursor.height()/2 + 1;
    var left_pos = ($('#slide-core').width()  * x_per / 1000) - $cursor.width()/2 + 1;
    $cursor.css("top",top_pos)
           .css("left",left_pos);
    if ( $cursor.css("display") == "none" ){
      $cursor.fadeIn("slow");
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


