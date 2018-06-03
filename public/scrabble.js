window.onload = function() {
    let socket = io.connect('http://localhost:3700');

    game = document.querySelector("#game")
    let letterActual = ''
    const BOXSIZE = 40
    const BOARDSIZE = 15
    const paper = new Raphael(game, BOXSIZE*BOARDSIZE, BOXSIZE*BOARDSIZE);
    let tab = []
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
        for (let x = 0; x < BOARDSIZE; x++) {
            let fillColor
            switch (tabC[y][x]) {
                case 3:
                    fillColor = "#0000FF"
                    break
                case 4:
                    fillColor ="#00C0FF"
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

            tab[y][x] = paper.rect(x*BOXSIZE, y*BOXSIZE, BOXSIZE, BOXSIZE)
                .attr({
                    fill: fillColor
                })
                .data(
                    "used",false
                )
                .click(function () {
                    socket.emit('clickBox', {
                        x: x,
                        y: y,
                        letter: letterActual,
                        caseValue: tabC[y][x]
                    });
                    document.querySelector('.carte.selected').remove()
                })
        }
        socket.on('clickBox', function (data) {
            paper.text(data.x*BOXSIZE+BOXSIZE/2, data.y*BOXSIZE+BOXSIZE/2, data.letter).attr({
                "font-size": BOXSIZE
            });
        })
    }

    let element = document.querySelector('#letters')

    socket.on('addLetter', function (data) {
        createLetter(data.letter)
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
            letterActual = letter
            selectLetter(this)
        })
    }
    
    function selectLetter (card) {
        let elements = document.querySelectorAll('.carte')
        for (i = 0; i < elements.length; i++) {
            elements[i].classList.remove('selected');
        }

        card.classList.add('selected')
    }
}