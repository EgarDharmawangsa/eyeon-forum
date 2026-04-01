import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  get,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA1qHO3H5PCaqOb7UEGpTHa1Tq2nbqQiqI",
  authDomain: "eyeonforum-dfdc2.firebaseapp.com",
  databaseURL: "https://eyeonforum-dfdc2-default-rtdb.firebaseio.com",
  projectId: "eyeonforum-dfdc2",
  storageBucket: "eyeonforum-dfdc2.firebasestorage.app",
  messagingSenderId: "1079811543935",
  appId: "1:1079811543935:web:56cbb55bdca0ca0426c04a",
  measurementId: "G-H5QC2LP08Q",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const chatContainer = document.getElementById("chat");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");

let dbMessage = null;
let bannedWords = [];

signInAnonymously(auth)
  .then(() => console.log("LOGIN SUCCESS"))
  .catch((err) => console.error("AUTH ERROR:", err));

async function loadBadWords() {
  try {
    const snapshot = await get(ref(db, "badwords"));
    bannedWords = snapshot.exists() ? snapshot.val() : [];
  } catch (err) {
    console.error("Badwords error:", err);
  }
}

function normalizeText(text) {
  return text.toLowerCase().replace(/[^a-z]/g, "");
}

function containsBadWords(text) {
  const clean = normalizeText(text);
  return bannedWords.some(word =>
    clean.includes(word.toLowerCase())
  );
}

function loadMessages() {
  if (!dbMessage) return;

  onValue(dbMessage, (snapshot) => {
    chatContainer.innerHTML = "";

    const data = snapshot.val();
    if (!data) return;

    Object.values(data).forEach((msg) => {
      const bubble = document.createElement("div");
      bubble.classList.add("message-bubble");

      if (auth.currentUser && msg.uid === auth.currentUser.uid) {
        bubble.classList.add("message-bubble-self");
      } else {
        bubble.classList.add("message-bubble-other");
      }

      bubble.textContent = msg.message;

      chatContainer.appendChild(bubble);
    });

    chatContainer.scrollTop = chatContainer.scrollHeight;
  });
}

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  if (!dbMessage) {
    alert("Database belum siap");
    return;
  }

  if (containsBadWords(text)) {
    alert("Pesan mengandung kata terlarang 🚫");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("User belum siap");
    return;
  }

  push(dbMessage, {
    message: text,
    uid: user.uid,
    createdAt: Date.now(),
  });

  messageInput.value = "";
}

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  dbMessage = ref(db, "messages");

  await loadBadWords();
  loadMessages();
});

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});