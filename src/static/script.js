var socket = io();
var crypt = new JSEncrypt();
var privatekey = localStorage.getItem("private_key");
inactiveMgs = {}

//get private/public key from server
function getkey(recipient = null) {
  if (recipient === null) {
    fetch("http://localhost:5000/getkey")
      .then((response) => response.json())
      .then((jsonData) => {
        privatekey = jsonData["private_key"];
        localStorage.setItem("private_key", privatekey);
      });
  } else {
    fetch("http://localhost:5000/getkey", {
      method: "POST",
      body: JSON.stringify({
        recipient: document.getElementById("connect_to").value,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((jsonResponse) => {
        recipientPublicKey =
          jsonResponse[document.getElementById("connect_to").value];
        localStorage.setItem(
          document.getElementById("connect_to").value,
          recipientPublicKey
        );
      });
  }
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

const userList = document.getElementById("userList");
let selectedUserIndex = -1;

socket.on("new_mesage", function (payload) {
  // handle new mesages
});

function sendMessage() {
  const message = messageInput.value;
  if (message.trim() === "") return;
  const activeUser = chatUserName.textContent;
  if (activeUser === "E2EE Web Chat") return;
  else {
    const chatBox = document.createElement("div");
    chatBox.textContent = message;
    chatBox.classList.add("chat-box", "sent");
    chatMessages.appendChild(chatBox);

    var recipientPublicKey = localStorage.getItem(activeUser);
    var encryptedMessage = "";
    if (recipientPublicKey != null) {
      encryptedMessage = encryptMessage(message, recipientPublicKey);
    } else {
      getkey(activeUser);
      recipientPublicKey = localStorage.getItem(activeUser);
      encryptedMessage = encryptMessage(message, recipientPublicKey);
    }
    socket.emit("private_message", {
      recipient: activeUser,
      message: encryptedMessage,
    });
  }
  messageInput.value = "";
}

socket.on("new_mesage", function (payload) {
  var decryptedMessage = "";
  if (payload["sender"] === activeUser) {
    if (privatekey != null) {
      decryptedMessage = decryptMessage(payload["message"], privatekey);
    } else {
      getkey();
      privatekey = localStorage.getItem("private_key");
      decryptedMessage = decryptMessage(payload["message"], privatekey);

      const chatBox = document.createElement("div");
      chatBox.textContent = decryptedMessage;
      chatBox.classList.add("chat-box", "sent");
      chatMessages.appendChild(chatBox);
    }
  }
  else{
    if (privatekey != null) {
        decryptedMessage = decryptMessage(payload["message"], privatekey);
      } else {
        getkey();
        privatekey = localStorage.getItem("private_key");
        decryptedMessage = decryptMessage(payload["message"], privatekey);
      }
      if(!(payload["sender"] in obj)){

      }
  }
});

// Unhides the chatbox when the connect button is pressed and only if connect_to form is filled
// document.getElementById('connect').onclick = function() {
//     if (document.getElementById('connect_to').value === "") {
//         alert("Please enter a username to connect")
//     } else if (document.getElementById('connect_to').value != "") {
//         const chatbox = document.getElementById('chatbox');
//         chatbox.style.display = 'block';
//         const sendbox = document.getElementById('sendbox');
//         sendbox.style.display = 'block';
//         getkey(document.getElementById('connect_to').value)
//     };
//     document.getElementById('send').onclick = function() {
//         var recipient = document.getElementById('connect_to').value;
//         var private_message = document.getElementById('message').value;
//         var recipientPublicKey = localStorage.getItem(recipient)
//         var encryptedMessage = encryptMessage(private_message, recipientPublicKey);
//         socket.emit('private_message', {
//             'recipient': recipient,
//             'message': encryptedMessage
//         });
//         let you = "You: "
//         let finalMessage = you.concat(private_message)
//         let ul = document.getElementById('chat-messages');
//         let li = document.createElement('li');
//         li.appendChild(document.createTextNode(finalMessage));
//         ul.appendChild(li);
//         ul.scrollTop = ul.scrollHeight;
//         document.getElementById('message').value = ""
//     };
//     socket.on('new_mesage', function(payload) {
//         const chatbox = document.getElementById('chatbox');
//         chatbox.style.display = 'block';
//         const sendbox = document.getElementById('sendbox');
//         sendbox.style.display = 'block';
//         document.getElementById('connect_to').value = payload['sender']
//         let ul = document.getElementById('chat-messages');
//         let li = document.createElement('li');
//         let message = payload['message']
//         // decrypt message here
//         var privateKey = localStorage.getItem("private_key");
//         var decryptedMessage = decryptMessage(message, privateKey);
//         let sender = payload['sender']
//         let finalMessage = sender.concat(": ", decryptedMessage)
//         li.appendChild(document.createTextNode(finalMessage));
//         ul.appendChild(li);
//         ul.scrollTop = ul.scrollHeight;
//     });
// };
