var socket = io();

const privatekey = localStorage.getItem("private_key");
if (!privatekey) {
    fetch('http://localhost:5000/getkey')
        .then(response => response.json())
        .then(jsonData => {
            privatekey = jsonData["private_key"]
            localStorage.setItem("private_key", privatekey)

        })
}

//encrypt function
function encryptMessage(message, publicKey) {
    const crypt = new JSEncrypt();
    crypt.setPublicKey(publicKey);
    var encryptedMessage = crypt.encrypt(message);
    return encryptedMessage;
}

//decrypt function
function decryptMessage(encryptedMessage, privateKey) {
    const crypt = new JSEncrypt();
    crypt.setPrivateKey(privateKey);
    var decryptedMessage = crypt.decrypt(encryptedMessage);
    return decryptedMessage;
}

// Unhides the chatbox when the connect button is pressed and only if connect_to form is filled
document.getElementById('connect').onclick = function() {
    if (document.getElementById('connect_to').value === "") {
        alert("Please enter a username to connect")
    } else if (document.getElementById('connect_to').value != "") {

        const chatbox = document.getElementById('chatbox');
        chatbox.style.display = 'block';

        const sendbox = document.getElementById('sendbox');
        sendbox.style.display = 'block';

        fetch("http://localhost:5000/getkey"), {
            method: "POST",
            body: JSON.stringify({
                "reciepient": document.getElementById('connect_to').value
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
            .then(response => response.json())
            .then(jsonData => {
                recipientPublicKey = jsonData[document.getElementById('connect_to').value]
                localStorage.setItem(document.getElementById('connect_to').value, recipientPublicKey);
            })
        };
    };

    document.getElementById('send').onclick = function() {
        var recipient = document.getElementById('connect_to').value;
        var private_message = document.getElementById('message').value;
        var recipientPublicKey = document.getItem(recipient)
        var encryptedMessage = encryptMessage(private_message, recipientPublicKey);

        socket.emit('private_message', {
            'recipient': recipient,
            'message': encryptedMessage
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

    socket.on('new_mesage', function(payload) {

        const chatbox = document.getElementById('chatbox');
        chatbox.style.display = 'block';

        const sendbox = document.getElementById('sendbox');
        sendbox.style.display = 'block';

        document.getElementById('connect_to').value = payload['sender']

        let ul = document.getElementById('chat-messages');
        let li = document.createElement('li');

        let message = payload['message']

        // decrypt message here
        var privateKey = localStorage.getItem("private_key");
        var decryptedMessage = decryptMessage(message, privateKey);
        let sender = payload['sender']
        let finalMessage = sender.concat(": ", decryptedMessage)
        li.appendChild(document.createTextNode(finalMessage));
        ul.appendChild(li);
        ul.scrollTop = ul.scrollHeight;

    });
};