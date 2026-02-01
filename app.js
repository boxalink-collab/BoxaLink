import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Importations modulaires
import { initAuth } from "./modules/auth.js";
import { initChats } from "./modules/chats.js";

const firebaseConfig = {
    apiKey: "AIzaSyBpDCnuhjRc1bj7YzIhIZhkl555V5o1HEE",
    authDomain: "boxalink-c4854.firebaseapp.com",
    projectId: "boxalink-c4854",
    storageBucket: "boxalink-c4854.firebasestorage.app",
    messagingSenderId: "794643093312",
    appId: "1:794643093312:web:f1609703cdf072f6e04ca5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUserData = null;

onAuthStateChanged(auth, async (user) => {
    const overlay = document.getElementById('auth-overlay');
    const view = document.getElementById('app-view');

    if (user) {
        try {
            const docSnap = await getDoc(doc(db, "users", user.uid));
            currentUserData = docSnap.exists() ? docSnap.data() : { name: "Utilisateur", role: "Membre" };
            overlay.classList.add('hidden');
            switchSection('chats');
        } catch (e) {
            view.innerHTML = `<div class="card">Erreur de chargement du profil : ${e.message}</div>`;
        }
    } else {
        overlay.classList.remove('hidden');
        initAuth(auth, db);
    }
});

function switchSection(id) {
    const view = document.getElementById('app-view');
    view.innerHTML = `<div style="padding:20px; text-align:center;">Chargement de ${id}...</div>`;
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.target === id);
    });

    if (id === 'chats') initChats(db, auth, currentUserData);
    else if (id === 'profile') {
        view.innerHTML = `<div class="card"><h2>${currentUserData.name}</h2><p>Rôle: ${currentUserData.role}</p></div>`;
    } else {
        view.innerHTML = `<div class="card">La section ${id} est en cours de développement.</div>`;
    }
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => switchSection(btn.dataset.target);
});

document.getElementById('main-logout').onclick = () => signOut(auth);
