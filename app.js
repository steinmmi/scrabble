let express = require("express");
let allLetters = require('./letters.js')

let app = express();
let port = 3700;
app.set('views', __dirname + '/template');
app.set('view engine', "jade");
app.use(express.static(__dirname + '/public'));
app.engine('jade', require('jade').__express);
app.get("/", function(req, res){
    res.render("index");
});

const MAINHAND = 7
let users = []

let io = require('socket.io').listen(app.listen(port));
let playerActual = ""
io.sockets.on('connection', function (socket) {
    users.push(socket.id)
    io.sockets.emit('newUser',socket.id)
    let tempLetters = []
    for(let i = 0; i < MAINHAND ; i++)
        sendLetter(socket)

    socket.on('clickBox', function (data) {
        console.log(`Clic en [${data.x},${data.y}] : ${data.letter} | ${socket.id} | ${data.caseValue}`)

        tempLetters.push(data)
        io.sockets.emit('clickBox', {
            x: data.x,
            y: data.y,
            letter: data.letter
        });
        console.log(tempLetters)
    });

    socket.on('endturn', function () {
        for(d in tempLetters)
            sendLetter(socket)
        tempLetters = []
    })
    socket.on('cancel', function () {
        io.sockets.emit('cancel', tempLetters)
        tempLetters = []
    })
    socket.on('disconnect', function() {
        users.splice(users.indexOf(socket.id), 1);
    });

});

function sendLetter(socket) {
    if(!allLetters.length) return null
    let index = Math.floor(Math.random() * allLetters.length)
    let letter = allLetters[index]
    allLetters.splice(index, 1);
    socket.emit('addLetter', {letter : letter})
}
