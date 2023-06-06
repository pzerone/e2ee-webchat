var socket = io();

// Unhides the chatbox when the connect button is pressed and only if connect to form is filled
document.getElementById('connect').onclick = function () {
    if (document.getElementById('connect_to').value === "") {
        alert("Please enter a username to connect")
    }
    else if (document.getElementById('connect_to').value != "") {
        const chatbox = document.getElementById('chatbox');
        chatbox.style.display = 'block';
    }
};


document.getElementById('send').onclick = function () {
    var recipient = document.getElementById('connect_to').value;

    var private_message = document.getElementById('message').value;
    socket.emit('private_message', { 'username': recipient, 'message': private_message });
};

socket.on('new_mesage', function(message) {
    alert(message);
});