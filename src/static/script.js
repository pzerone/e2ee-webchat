// Establish a socket connection
var socket = io();

// Unhides the chatbox when the connect button is pressed and only if connect_to form is filled
document.getElementById('connect').onclick = function () {
    if (document.getElementById('connect_to').value === "") {
        alert("Please enter a username to connect")
    }
    else if (document.getElementById('connect_to').value != "") {

        const chatbox = document.getElementById('chatbox');
        chatbox.style.display = 'block';

        const sendbox = document.getElementById('sendbox');
        sendbox.style.display = 'block';
    }
};

document.getElementById('send').onclick = function () {
    var recipient = document.getElementById('connect_to').value;
    var private_message = document.getElementById('message').value;
    socket.emit('private_message', { 'recipient': recipient, 'message': private_message });
    let you = "You: "
    let finalMessage = you.concat(private_message)
    let ul = document.getElementById('chat-messages');
    let li = document.createElement('li');
    li.appendChild(document.createTextNode(finalMessage));
    ul.appendChild(li);
    ul.scrollTop = ul.scrollHeight;
    document.getElementById('message').value = ""
};

socket.on('new_mesage', function (payload) {

    const chatbox = document.getElementById('chatbox');
    chatbox.style.display = 'block';

    const sendbox = document.getElementById('sendbox');
    sendbox.style.display = 'block';

    document.getElementById('connect_to').value = payload['sender']

    let ul = document.getElementById('chat-messages');
    let li = document.createElement('li');
    
    let message = payload['message']
    let sender = payload['sender']
    let finalMessage = sender.concat(": ", message)
    li.appendChild(document.createTextNode(finalMessage));
    ul.appendChild(li);
    ul.scrollTop = ul.scrollHeight;
});