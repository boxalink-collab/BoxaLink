import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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
let isLoginMode = false;

// --- GESTION AUTH ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById('auth-overlay').classList.add('hidden');
        renderSection('chats');
    } else {
        document.getElementById('auth-overlay').classList.remove('hidden');
    }
});

document.getElementById('auth-toggle').onclick = () => {
    isLoginMode = !isLoginMode;
    document.getElementById('reg-name').classList.toggle('hidden', isLoginMode);
    document.getElementById('btn-action').innerText = isLoginMode ? "Se connecter" : "S'inscrire";
    document.getElementById('auth-toggle').innerText = isLoginMode ? "Nouveau ? Créer un compte" : "Déjà inscrit ? Se connecter";
};

document.getElementById('btn-action').onclick = async () => {
    const phone = document.getElementById('reg-phone').value;
    const pass = document.getElementById('reg-pass').value;
    const name = document.getElementById('reg-name').value;
    const fakeEmail = `${phone.replace('+', '')}@boxalink.com`;

    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, fakeEmail, pass);
        } else {
            const res = await createUserWithEmailAndPassword(auth, fakeEmail, pass);
            await setDoc(doc(db, "users", res.user.uid), { name, phone, uid: res.user.uid });
        }
    } catch (e) { alert("Erreur: " + e.message); }
};

document.getElementById('btn-logout').onclick = () => signOut(auth);

// --- NAVIGATION ET CHAT ---
function renderSection(id) {
    const view = document.getElementById('app-view');
    view.innerHTML = "";

    if (id === 'chats') {
        view.innerHTML = `
            <div style="padding:20px"><h2>Discussions</h2><p>Aucun message pour le moment.</p></div>
            <button class="fab" id="add-chat"><i class="fas fa-plus"></i></button>
        `;
        
        document.getElementById('add-chat').onclick = async () => {
            const targetPhone = prompt("Entrez le numéro du contact :");
            if(!targetPhone) return;

            // Vérifier si le contact existe sur BoxaLink
            const q = query(collection(db, "users"), where("phone", "==", targetPhone));
            const snap = await getDocs(q);

            if (!snap.empty) {
                alert("Contact trouvé ! Ouverture de la discussion...");
                // Logique pour ouvrir le chat ici
            } else {
                if(confirm("Ce contact n'est pas sur BoxaLink. L'inviter par SMS ?")) {
                    window.location.href = `sms:${targetPhone}?body=Rejoins-moi sur BoxaLink ! Connect. Share. Grow.`;
                }
            }
        };
    } else {
        view.innerHTML = `<div style="padding:20px"><h2>Section ${id}</h2><p>Contenu en cours...</p></div>`;
    }
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderSection(btn.dataset.target);
    };
});
