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
let started = false
let players = []
let scores = []

const tabC = [[1,0,0,4,0,0,0,1,0,0,0,4,0,0,1],
    [0,2,0,0,0,3,0,0,0,3,0,0,0,2,0],
    [0,0,2,0,0,0,4,0,4,0,0,0,2,0,0],
    [4,0,0,2,0,0,0,4,0,0,0,2,0,0,4],
    [0,0,0,0,2,0,0,0,0,0,2,0,0,0,0],
    [0,3,0,0,0,3,0,0,0,3,0,0,0,3,0],
    [0,0,4,0,0,0,4,0,4,0,0,0,4,0,0],
    [1,0,0,4,0,0,0,9,0,0,0,4,0,0,1],
    [0,0,4,0,0,0,4,0,4,0,0,0,4,0,0],
    [0,3,0,0,0,3,0,0,0,3,0,0,0,3,0],
    [0,0,0,0,2,0,0,0,0,0,2,0,0,0,0],
    [4,0,0,2,0,0,0,4,0,0,0,2,0,0,4],
    [0,0,2,0,0,0,4,0,4,0,0,0,2,0,0],
    [0,2,0,0,0,3,0,0,0,3,0,0,0,2,0],
    [1,0,0,4,0,0,0,1,0,0,0,4,0,0,1]]

const lettersValue = {A : 1,B : 3,C : 3,D : 2,E : 1,F : 4,G : 2,H : 4,I : 1,J : 8,K : 5,L : 1,M : 3,N : 1,O : 1,P : 3,Q : 10,R : 1,S : 1,T : 1,U : 1,V : 4,W : 4,X : 8,Y : 4,Z : 10}
const MAINHAND = 7
let users = {}

let gameLetters = []
for(let i = 0; i < 15; i++) {
  gameLetters[i] = []
}

let io = require('socket.io').listen(app.listen(port));
let playerActual = ""
io.sockets.on('connection', function (socket) {

  socket.on('setName',function(name) {
    users[socket.id] = name
    io.sockets.emit('notification', {
      message: `L'utilisateur ${users[socket.id]} vient de se connecter...`,
      type: 'system'
    })
  })
    let tempLetters = []

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

    socket.on('endturn', function (data) {
        let totalBonus = 1
        let totalPts = 0
        let wordPts = 0
        indexLetter = tempLetters[0]
        if(data.x.length < 2 && data.y.length < 2) {
          io.sockets.emit('cancel', tempLetters)
          socket.emit('validate', false)
          tempLetters = []
          return null
        }
        if(data.x.length > 1)
        for(lett of data.x) {
          if(lett.x > indexLetter.x) indexLetter = lett
          let bonus = 1
            switch (tabC[lett.y][lett.x]) {
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
            wordPts += bonus*lettersValue[lett.letter]
            gameLetters[lett.y][lett.x] = lett.letter
        }
        totalPts += wordPts*totalBonus
        totalBonus = 1
        wordPts = 0
        if(data.y.length > 1)
        for(lett of data.y) {
          let bonus = 1
          console.log(lett.y+ " " +lett.x)
            switch (tabC[lett.y][lett.x]) {
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
            console.log(totalBonus + " " + bonus + " : " + lett.letter)
            wordPts += bonus*lettersValue[lett.letter]
            gameLetters[lett.y][lett.x] = lett.letter
        }
        totalPts+= wordPts*totalBonus
        console.log(totalPts)
        for(let temp of tempLetters) sendLetter(socket.id)
        tempLetters = []
        socket.emit('validate', true)

        io.sockets.emit('notification', {
          message: `Le joueur ${users[socket.id]} a fait un score de ${totalPts}`,
          type: 'system'
        })
        scores[actualPlayer] += totalPts
        nextTurn()
    })
    socket.on('cancel', function () {
        io.sockets.emit('cancel', tempLetters)
        tempLetters = []
    })
    socket.on('message', function(msg) {
      if(msg.charAt(0) === '/')
        switch (msg) {
          case '/start':
            if(!started)
              start()
            break;
          case '/score':
            if(started)
              askScore()
            break
          default:
            socket.emit('notification', {
              message: `Cette commande n'existe pas, tapez /help pour plus d'information`,
              type: 'system'
            })
        }
      else {
      io.sockets.emit('notification', {
        message: `<b>${users[socket.id]}</b> : `+msg,
        type: 'message'
      })
    }
    })

    socket.on('disconnect', function() {
      if(users[socket.id]) {
      io.sockets.emit('notification', {
        message: `L'utilisateur ${users[socket.id]} vient de se déconnecter...`,
        type: 'system'
      })
    }
    delete users[socket.id]
    });
});

function sendLetter(socketId) {
    if(!allLetters.length) return null
    let index = Math.floor(Math.random() * allLetters.length)
    let letter = allLetters[index]
    allLetters.splice(index, 1);
    io.sockets.connected[ socketId ].emit('addLetter', {letter : letter})
}

function start() {
  io.sockets.emit('notification', {
    message: `La partie démarre ...`,
    type: 'system'
  })
  for(id in users) {
  for(let i = 0; i < MAINHAND ; i++)
      sendLetter(id)
  players.push(id)
  scores.push(0)
  }
  actualPlayer = -1
  started = true
  nextTurn()
}

function askScore (socket) {
  for(let playerId in players)
    console.log(scores[playerId])
}

function nextTurn() {
  actualPlayer++
  if(actualPlayer >= players.length) actualPlayer = 0
  io.sockets.emit('notification', {
    message: `Au tour de `+users[players[actualPlayer]],
    type: 'system'
  })
  io.sockets.emit('whosTurn',users[players[actualPlayer]])
}
