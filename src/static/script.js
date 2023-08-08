var socket = io();
var crypt = new JSEncrypt();

var privatekey = localStorage.getItem("private_key");
if (!privatekey) {
    fetch('http://localhost:5000/getkey')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(jsonResponse => {
        privatekey = jsonResponse["private_key"];
        localStorage.setItem("private_key", privatekey);
    })
    .catch(error => {
        console.error('Error occurred:', error);
    });
}

//encrypt function
function encryptMessage(message, publicKey) {
    crypt.setPublicKey(publicKey);
    var encryptedMessage = crypt.encrypt(message);
    return encryptedMessage;
}

//decrypt function
function decryptMessage(encryptedMessage, privateKey) {
    crypt.setPrivateKey(privateKey);
    var decryptedMessage = crypt.decrypt(encryptedMessage);
    return decryptedMessage;
}

// Unhides the chatbox when the connect button is pressed and only if connect_to form is filled
document.getElementById('connect').onclick = function () {
    if (document.getElementById('connect_to').value === "") {
        alert("Please enter a username to connect")
    } else if (document.getElementById('connect_to').value != "") {

        const chatbox = document.getElementById('chatbox');
        chatbox.style.display = 'block';

        const sendbox = document.getElementById('sendbox');
        sendbox.style.display = 'block';

        fetch("http://localhost:5000/getkey", {
            method: "POST",
            body: JSON.stringify({
                "recipient": document.getElementById('connect_to').value
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(jsonResponse => {
                recipientPublicKey = jsonResponse[document.getElementById('connect_to').value]
                localStorage.setItem(document.getElementById('connect_to').value, recipientPublicKey);
                // console.log(recipientPublicKey)
            })
            .catch(error => {
                console.error('Error occurred:', error);
            });
    };
};
document.getElementById('send').onclick = function () {
    var recipient = document.getElementById('connect_to').value;
    var private_message = document.getElementById('message').value;
    var recipientPublicKey = localStorage.getItem(recipient);
    var encryptedMessage = encryptMessage(private_message, recipientPublicKey);
    console.log(encryptedMessage);

    socket.emit('private_message', {
        'recipient': recipient,
        'message': private_message,
    });
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

    var message = payload['message'];
    // console.log(message);
    // decrypt message here
    var privateKey = localStorage.getItem("private_key");

    var decryptedMessage = decryptMessage(message, privateKey);

    let sender = payload['sender']
    let finalMessage = sender.concat(": ", message)
    li.appendChild(document.createTextNode(finalMessage));
    ul.appendChild(li);
    ul.scrollTop = ul.scrollHeight;

});