window.onload = function() {
    var socket = io.connect('http://localhost:3700');

    sendButton = document.querySelector('#button')
    sendButton.onclick = function () {
        var text = "Un test";
        socket.emit('send', {message: text});
    }
}