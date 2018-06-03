var express = require("express");
var app = express();
var port = 3700;

app.set('views', __dirname + '/template');
app.set('view engine', "jade");
app.use(express.static(__dirname + '/public'));

app.engine('jade', require('jade').__express);
app.get("/", function(req, res){
    res.render("index");
});

var io = require('socket.io').listen(app.listen(port));
io.sockets.on('connection', function (socket) {
    socket.on('send', function (data) {
        console.log(data.message)
    });
});
