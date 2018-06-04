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

const lettersValue = {A : 1,B : 3,C : 3,D : 2,E : 1,F : 4,G : 2,H : 4,I : 1,J : 8,K : 5,L : 1,M : 3,N : 1,O : 1,P : 3,Q : 10,R : 1,S : 1,T : 1,U : 1,V : 4,W : 4,X : 8,Y : 4,Z : 10}
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
        let totalBonus = 1
        let bonus = 1
        let totalPts = 0
        for(lett of tempLetters) {
            switch (lett.caseValue) {
                case 4:
                    bonus = 2
                    break
                case 3:
                    bonus = 3
                    break
                case 1:
                    totalBonus*=3
                    break
                case 2:
                    totalBonus*=2
                    break
                case 9:
                    totalBonus*=2
                    break
            }
            totalPts += bonus*lettersValue[lett.letter]
            sendLetter(socket)
        }
        console.log("Le mot vaut : "+totalPts*totalBonus)
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
