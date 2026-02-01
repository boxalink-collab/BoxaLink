import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Importation des modules (Ils seront remplis après)
import { initAuth } from './modules/auth.js';
import { initChats } from './modules/chats.js';
import { initAgora } from './modules/agora.js';
import { initProfile } from './modules/profile.js';
// Ajoute ici les autres imports : forums, library, market

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

let userData = null;

// Surveiller l'état de connexion
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Utilisateur connecté : on récupère son profil
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        userData = docSnap.data();
        
        document.getElementById('auth-overlay').classList.add('hidden');
        switchSection('chats'); // Charge la section par défaut
    } else {
        // Non connecté : on lance le module d'auth
        document.getElementById('auth-overlay').classList.remove('hidden');
        initAuth(auth, db);
    }
});

// Gestion de la navigation
function switchSection(id) {
    const view = document.getElementById('app-view');
    view.innerHTML = ""; // On vide la vue
    
    // Mise à jour visuelle des boutons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.target === id);
    });

    // Appel du module correspondant
    if (id === 'chats') initChats(db, auth, userData);
    else if (id === 'agora') initAgora(db, auth, userData);
    else if (id === 'profile') initProfile(db, auth, userData);
    else {
        view.innerHTML = `<div class="card">La section <b>${id}</b> sera bientôt disponible.</div>`;
    }
}

// Écouteurs sur les boutons de navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => switchSection(btn.dataset.target);
});
