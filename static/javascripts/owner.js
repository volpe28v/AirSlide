var slideList = null;
var slideListJpg = function(){
  var dir_name = null;
  var file_list = null;
  var current_no = 0;
  var move_action_handler = null;
  var select_action_handler = null;

  return {
    set: function(slide_data, move_handler, select_handler, loading_handler, call_back){
      current_no = 0;
      file_list = slide_data.list;
      dir_name = slide_data.dir;
      move_action_handler = move_handler;
      select_action_handler = select_handler;

      call_back();
    },
    current: function(){
      return { type: "jpg", name: dir_name + "/" + file_list[current_no] };
    },
    set_current: function(no){
      current_no = no;
      if ( current_no < 0 ){ current_no = 0; }
      if ( current_no >= file_list.length ){ current_no = file_list.length - 1; }

      select_action_handler(current_no, file_list.length);
    },
    set_first: function(){
      this.set_current(0);
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
    first: function(){
      current_no = 2;

      this._call_action_handler();
      return this.current();
    },
    last: function(){
      current_no = file_list.length - 1;

      this._call_action_handler();
      return this.current();
    },
    get_num: function(){
      return file_list.length;
    },
    get_all_dom: function(call_back){
      var all_dom = [];
      for (i = 0; i < file_list.length; i++){
        all_dom.push(this.get_dom(i));
      }
      call_back(all_dom);
    },
    get_dom: function(i){
      return $('<img/>').attr('src', "/data/" + this.get_by(i));
    },
    get_preview_dom: function(info){
      return $('<img/>').attr('src', "/data/" + info.name);
    },
    _call_action_handler: function(){
      var start_pos = current_no - 1;
      if ( start_pos > file_list.length - 5 ){ start_pos = file_list.length - 5; }
      move_action_handler(start_pos);
    }
  };
}();

var slideListPdf = function(){
  var file_name = "";
  var file_length = 0;
  var page_list = [];
  var current_no = 0;
  var move_action_handler = null;
  var select_action_handler = null;
  var loading_action_handler = null;
  var render_progress = 0;

  return {
    set: function(slide_data, move_handler, select_handler, loading_handler, call_back){
      file_name = slide_data.path;
      current_no = 0;
      render_progress = 0;
      page_list = [];
      move_action_handler = move_handler;
      select_action_handler = select_handler;
      loading_action_handler = loading_handler;

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
            //console.log("complete psuh_page");
            return;
          }else{
            push_page(pdf, page_number++, push_page_complete);
          }
        });
      });
    },
    current: function(){
      return { type: "pdf", name: file_name, no: current_no };
    },
    set_current: function(no){
      current_no = no;
      if ( current_no < 0 ){ current_no = 0; }
      if ( current_no >= file_length ){ current_no = file_length - 1; }

      select_action_handler(current_no, file_length);
    },
    set_first: function(){
      this.set_current(0);
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
    first: function(){
      current_no = 2;

      this._call_action_handler();
      return this.current();
    },
    last: function(){
      current_no = file_length - 1;

      this._call_action_handler();
      return this.current();
    },
    get_num: function(){
      return file_length;
    },
    get_all_dom: function(call_back){
      var all_dom = [];
      var page_num = 0;
      var that = this;

      that.get_dom(page_num++,function push_dom(dom){
        all_dom.push(dom);
        if (page_num >= file_length){
          call_back(all_dom);
          return;
        }else{
          that.get_dom(page_num++,push_dom);
        }
      });
    },
    get_dom: function(i,call_back){
      var page = page_list[i];
      var scale = 0.3;
      var viewport = page.getViewport(scale);
      var canvas = $('<canvas>');
      var context = canvas.get(0).getContext('2d');
      canvas.attr('height', viewport.height);
      canvas.attr('width', viewport.width);

      var that = this;
      page.render({canvasContext: context, viewport: viewport}).then(function(){
        call_back(canvas);
        loading_action_handler(++render_progress, file_length);
      });
    },
    get_preview_dom: function(info){
      var page = page_list[info.no];
      var scale = 1.0;
      var viewport = page.getViewport(scale);
      var canvas = $('<canvas>');
      var context = canvas.get(0).getContext('2d');
      canvas.attr('height', viewport.height);
      canvas.attr('width', viewport.width);

      page.render({canvasContext: context, viewport: viewport});
      return canvas;
    },
    _call_action_handler: function(){
      var start_pos = current_no - 1;
      if ( start_pos > file_length - 5 ){ start_pos = file_length - 5; }
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
    if ( slide_data.type == "jpg" ){
      slideList = slideListJpg;
    } else if ( slide_data.type == "pdf" ){
      //console.log("get_list for pdf");
      slideList = slideListPdf;
    }
    slideList.set(slide_data,
      function(no){ // move_handler
        // for thumb
        $('#slider-code').tinycarousel_move(no);
      },
      function(no, total){ // select_hander
        // for thumb
        $('.thumb').addClass("normal-thumb");
        $('.thumb').removeClass("current-thumb");
        $('#thumb_' + no).addClass("current-thumb");
        // for progress num
        $('#progress_num').html((no + 1) + "/" + total);
        // for server
        socket.emit('select_file',slideList.current());
      },
      function(progress, total){ // loading_handler
        // for progress bar 
        $('#loading_thumb').fadeIn('fast');
        $('#loading_progress_bar').css('width',(progress * 100 / (total) + "%"));

        if (progress == total){
          $('#loading_thumb').fadeOut('slow');
        }
      },
      function(){ // call_back
        // create thumb
        $('#thumb-list').empty();
        $('#slide-main').fadeOut();
        $('#progress_num').fadeOut();
        slideList.get_all_dom(function(all_dom){
          for(var i = 0; i < all_dom.length; i++){
            var thumb = $('<li/>').append(all_dom[i].attr('id',"thumb_" + i).addClass("thumb normal-thumb").addClass("pointer-item"));
            thumb.click(function(){
              var no = i;
              return function(){
                slideList.set_current(no);
              }
            }());
            $('#thumb-list').append(thumb);
          }
          $('#slider-code').tinycarousel({display: 1, duration: 500});
          slideList.set_first();
          $('#slide-main').fadeIn();
          $('#progress_num').fadeIn();
        });
      }
    );
  });

  socket.on('select_file',function(file_info){
    if (slideList == null){ return; }
    var slide_img = $(slideList.get_preview_dom(file_info)).attr('id',"slide-preview").addClass('pointer-item');
    $('#slide').hide();
    $('#slide').empty();
    $('#slide').append(slide_img);
    $('#slide').fadeIn();
  });

  socket.on('disconnect', function(){
  });

  $('#slide').click(function(){
    slideList.next();
  });

  $('#slide-prev').click(function(){
    slideList.prev();
  });

  $('#slide-next').click(function(){
    slideList.next();
  });

  $('#slide-first').click(function(){
    slideList.first();
  });

  $('#slide-last').click(function(){
    slideList.last();
  });

  $('#slide').mousemove(function(e){
    var x = parseInt(e.pageX - $(this).position().left);
    var y = parseInt(e.pageY - $(this).position().top);
    var x_per = parseInt(x / $(this).width() * 1000);
    var y_per = parseInt(y / $(this).height() * 1000);

    socket.emit('mouse_pointer',{ x_per: x_per ,y_per: y_per });
  });

  $('#slide').mouseout(function(e){
    socket.emit('mouse_pointer',{ x_per: -1 ,y_per: -1 });
  });
});

