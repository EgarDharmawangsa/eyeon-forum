import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA1qHO3H5PCaqOb7UEGpTHa1Tq2nbqQiqI",
  authDomain: "eyeonforum-dfdc2.firebaseapp.com",
  databaseURL: "https://eyeonforum-dfdc2-default-rtdb.firebaseio.com",
  projectId: "eyeonforum-dfdc2",
  storageBucket: "eyeonforum-dfdc2.firebasestorage.app",
  messagingSenderId: "1079811543935",
  appId: "1:1079811543935:web:56cbb55bdca0ca0426c04a",
  measurementId: "G-H5QC2LP08Q"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbMessage = ref(db, "messages");
let chatContainer = document.getElementById("chat");

onValue(dbMessage, (dataMessages) => {
    chatContainer.innerHTML = "";

    Object.values(dataMessages.val()).forEach(message => {
        let messageBubbles = document.createElement("div");
        messageBubbles.classList.add("message-bubble");
        messageBubbles.textContent = message.message;
        chatContainer.appendChild(messageBubbles);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    });
});

const sendMessage = () => {
    let messageInput = document.getElementById("message");
    let messageUser = messageInput.value.trim();
    if (!messageUser) return;
    push(dbMessage, {
        message: messageUser
    })
    messageInput.value = "";
}

window.sendMessage = sendMessage;