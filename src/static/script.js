var socket = io();

//encrypt function
function encryptMessage(message, publicKey) {
    const crypt = new JSEncrypt();
    crypt.setPublicKey(publicKey);
    const encryptedMessage = crypt.encrypt(message);
    return encryptedMessage;
  }
  
//decrypt function
function decryptMessage(encryptedMessage, privateKey) {
    const crypt = new JSEncrypt();
    crypt.setPrivateKey(privateKey);
    const decryptedMessage = crypt.decrypt(encryptedMessage);
    return decryptedMessage;
  }

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
    // encrypt and create encrypted_private_message variable
    // call func here
    //here recipient public key is defined as recipientPublicKey
    const encryptedMessage = encryptMessage(private_message, recipientPublicKey);

    //send encryptedMessage instead of private_message
    socket.emit('private_message', { 'recipient': recipient, 'message': encryptedMessage });
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

    // decrypt message here
    const privateKey = localStorage.getItem(private_key);
    const decryptedMessage = decryptMessage(encryptedMessage, privateKey);
    let sender = payload['sender']
    let finalMessage = sender.concat(": ", message)
    li.appendChild(document.createTextNode(finalMessage));
    ul.appendChild(li);
    ul.scrollTop = ul.scrollHeight;
});