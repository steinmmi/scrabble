window.onload = function() {
    let socket = io.connect('http://localhost:3700');

    game = document.querySelector("#game")
    let letterActual = ''
    const BOXSIZE = 60
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
            })
            .click(function () {
                if (!letterActual) return null

                tab[y][x].attr({
                    fill:"#DDBB8F"
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
            });

        }
    }
    socket.on('clickBox', function (data) {

        imgLetters[data.y][data.x].attr({
            src: `letters/${data.letter}.jpg`
        });
    })
    let element = document.querySelector('#letters')

    socket.on('addLetter', function (data) {
        createLetter(data.letter)
    })

    socket.on('cancel', function (data) {
        data.forEach(function (doc) {
            imgLetters[doc.y][doc.x].attr({src: ""})
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