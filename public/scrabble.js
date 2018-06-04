window.onload = function() {
    let socket = io.connect('http://localhost:3700');
    let myName = prompt('Quel est ton pseudo ?')
    if(!myName) return null
    socket.emit('setName',myName)
    game = document.querySelector("#game")
    let letterActual = ''
    const BOXSIZE = 50
    const BOARDSIZE = 15
    const paper = new Raphael(game, BOXSIZE*BOARDSIZE, BOXSIZE*BOARDSIZE);
    let tab = []
    let imgLetters = []
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

    let actualWord = {}
    let myTurn = false

    for(let y = 0; y < BOARDSIZE; y++ ) {
        tab[y] = []
        imgLetters[y] = []
        for (let x = 0; x < BOARDSIZE; x++) {
            let fillColor
            switch (tabC[y][x]) {
                case 3:
                    fillColor = "#0000FF"
                    break
                case 4:
                    fillColor = "#00C0FF"
                    break
                case 9:
                    fillColor = "gold"
                    break
                case 1:
                    fillColor = "red"
                    break
                case 2:
                    fillColor = "#FF80E5"
                    break
                default:
                    fillColor = "#19BE72"
                    break
            }

            tab[y][x] = paper.rect(x * BOXSIZE, y * BOXSIZE, BOXSIZE, BOXSIZE)
                .attr({
                    fill: fillColor
                })
                .data(
                    "used", false
                )
            imgLetters[y][x] = paper.image(``, x * BOXSIZE, y * BOXSIZE, BOXSIZE, BOXSIZE).attr({
                fill: "black"
            }).data('value','')
            .click(function () {
                if (!letterActual) return null

                if(!myTurn) return null
                if(imgLetters[y][x].attr('src') !== 'about:blank' && imgLetters[y][x].attr('src') !== '') return null
                socket.emit('clickBox', {
                    x: x,
                    y: y,
                    letter: letterActual,
                    caseValue: tabC[y][x]
                });
                document.querySelector('.selected').classList.add('used')
                document.querySelector('.selected').classList.remove('selected')
                letterActual = ''
            });

        }
    }
    socket.on('clickBox', function (data) {
        imgLetters[data.y][data.x].attr({
            src: `letters/${data.letter}.jpg`
        }).data('value',data.letter);
        let i = 0
        let j = 0
        actualWord.x = []
        actualWord.y = []
        while (imgLetters[data.y][data.x-i].data('value') !== '')
          i++
        while (imgLetters[data.y-j][data.x].data('value') !== '')
          j++
        let startXIndex = data.x-i+1
        let startYIndex = data.y-j+1
        console.log(startYIndex)
        i = 0
        j = 0
      while (imgLetters[data.y][startXIndex+i].data('value') !== '') {
          actualWord.x.push({y: data.y, x: startXIndex+i, letter: imgLetters[data.y][startXIndex+i].data('value')})
          i++
      }
      while (imgLetters[startYIndex+j][data.x].data('value') !== '') {
        actualWord.y.push({y: startYIndex+j, x: data.x, letter: imgLetters[startYIndex+j][data.x].data('value')})
        j++
    }
      console.log(actualWord)
    })
    let element = document.querySelector('#letters')

    socket.on('addLetter', function (data) {
        createLetter(data.letter)
    })

    socket.on('notification',function(data) {
      let chatArea = document.querySelector('#textarea')
      let message = document.createElement('p')
      message.classList.add(data.type)
      message.innerHTML = data.message
      chatArea.appendChild(message)
    })

    socket.on('cancel', function (data) {
        data.forEach(function (doc) {
            imgLetters[doc.y][doc.x].attr({src: ""}).data('value','')
            let fillColor =''
            switch (tabC[doc.y][doc.x]) {
                case 3:
                    fillColor = "#0000FF"
                    break
                case 4:
                    fillColor = "#00C0FF"
                    break
                case 9:
                    fillColor = "gold"
                    break
                case 1:
                    fillColor = "red"
                    break
                case 2:
                    fillColor = "#FF80E5"
                    break
                default:
                    fillColor = "#19BE72"
                    break
            }
            tab[doc.y][doc.x].attr({
                fill: fillColor
            })
        })

    })


    function createLetter (letter) {
        let letterContainer = document.createElement('div')
        letterContainer.setAttribute('class','carte')
        let img = document.createElement("img");
        img.setAttribute("src", `letters/${letter}.jpg`);
        img.setAttribute("value", letter);
        img.setAttribute("name", 'letter');
        letterContainer.appendChild(img)
        element.appendChild(letterContainer)

        letterContainer.addEventListener('click', function () {
            if (this.classList.contains('used')) return false
            letterActual = letter
            selectLetter(this)
        })
    }


    document.querySelector('#cancel').addEventListener('click',function () {
        let usedCards = document.querySelectorAll('.used')
        for (i = 0; i < usedCards.length; i++) {
            usedCards[i].classList.remove('used');
        }
        socket.emit('cancel')
    })

    document.querySelector('#chatButton').addEventListener('click', function () {
      socket.emit('message', document.querySelector('#chatInput').value)
      document.querySelector('#chatInput').value = ''
    })
    document.querySelector('#endturn').addEventListener('click',function () {
        let usedCards = document.querySelectorAll('.used')
        if(myTurn)
        socket.emit('endturn', actualWord)
    })
    socket.on('validate', function(data) {
      let usedCards = document.querySelectorAll('.used')
      console.log(data)
      if(!data) {
        for (i = 0; i < usedCards.length; i++) {
            usedCards[i].classList.remove('used');
          }
      }
      else {
        for (i = 0; i < usedCards.length; i++) {
          usedCards[i].remove('used');
        }
      }
    })
    socket.on('whosTurn', function(name) {
      console.log('au tour de '+ name)
      let gameArea = document.querySelector('#game')
      if(name === myName) {
        myTurn = true
        gameArea.classList.remove('disabled')
      }
      else {
        myTurn = false
        gameArea.classList.add('disabled')
      }
    })
    function selectLetter (card) {
        let elements = document.querySelectorAll('.carte')
        for (i = 0; i < elements.length; i++) {
            elements[i].classList.remove('selected');
        }
        card.classList.add('selected')
    }
}
