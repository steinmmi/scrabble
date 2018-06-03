window.onload = function() {
    let socket = io.connect('http://localhost:3700');

    game = document.querySelector("#game")
    let letterActual = ''
    const BOXSIZE = 40
    const BOARDSIZE = 15
    const paper = new Raphael(game, BOXSIZE*BOARDSIZE, BOXSIZE*BOARDSIZE);
    let tab = []
    let usedLetters = []
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



console.log(socket.sessionID)
    for(let y = 0; y < BOARDSIZE; y++ ) {
        tab[y] = []
        usedLetters[y] = []
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
                .click(function () {
                    if (!letterActual) return null
                    usedLetters.push({
                        x: x,
                        y: y,
                        letter: letterActual,
                        caseValue: tabC[y][x]
                    })


                    socket.emit('clickBox', {
                        x: x,
                        y: y,
                        letter: letterActual,
                        caseValue: tabC[y][x]
                    });
                    document.querySelector('.selected').classList.add('used')
                    document.querySelector('.selected').classList.remove('selected')
                    letterActual = ''
                })
            usedLetters[y][x] = paper.text(x * BOXSIZE + BOXSIZE / 2, y * BOXSIZE + BOXSIZE / 2, '').attr({
                "font-size": BOXSIZE
            });

        }
    }
    socket.on('clickBox', function (data) {
        console.log(usedLetters[data.y][data.x])
        usedLetters[data.y][data.x].attr({
            text: data.letter
        });
    })
    let element = document.querySelector('#letters')

    socket.on('addLetter', function (data) {
        createLetter(data.letter)
    })

    socket.on('cancel', function (data) {
        data.forEach(function (doc) {
            usedLetters[doc.y][doc.x].attr({text: ""})
        })
    })

    socket.on('newUser',function (data) {
        console.log(data)
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

    document.querySelector('#endturn').addEventListener('click',function () {
        let usedCards = document.querySelectorAll('.used')
        for (i = 0; i < usedCards.length; i++) {
            usedCards[i].remove('used');
        }
        socket.emit('endturn')
    })
    function selectLetter (card) {
        let elements = document.querySelectorAll('.carte')
        for (i = 0; i < elements.length; i++) {
            elements[i].classList.remove('selected');
        }

        card.classList.add('selected')
    }
}