# AirSlide

スライド資料の操作をWeb上で共有する

## やりたいこと
* テレビ会議でパワポなどのスライド資料の操作をブラウザ上で同期したい

## いまのところできること
* スライドを画像化したデータをサーバに置いてスライド送りの操作をリアルタイムで同期する
* スライドを操作する側は owner にアクセス
* スライドを閲覧する側は viewer にアクセス

## install
必要なもの

* node 

<pre>
$ git clone git@github.com:volpe28v/AirSlide.git
$ cd AirSlide
$ npm install 
</pre>

* 起動

static/data 配下に画像化したスライドを格納する(jpg,pngなど)

<pre>
$ node app.js -p 3000
</pre>
* -p ポート番号

## 使う
* オーナーサイト(スライドを操作する側)
<pre>
http://localhost:3000/owner
</pre>

* ビューアサイト(スライドを閲覧する側)
<pre>
http://localhost:3000/viewer
</pre>

## License
(The MIT License)

Copyright (c) 2012 Naoki KODAMA <naoki.koda@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

