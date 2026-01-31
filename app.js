import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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

// --- GESTIONNAIRE D'AUTHENTIFICATION ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        currentUserData = docSnap.data();
        document.getElementById('auth-overlay').classList.add('hidden');
        renderSection('chats');
    } else {
        document.getElementById('auth-overlay').classList.remove('hidden');
    }
});

// --- ACTIONS AUTH ---
document.getElementById('btn-signup').onclick = async () => {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        await setDoc(doc(db, "users", res.user.uid), { name, email, role: "user", bio: "Nouveau membre" });
    } catch (e) { alert(e.message); }
};

document.getElementById('btn-login').onclick = async () => {
    const email = document.getElementById('log-email').value;
    const pass = document.getElementById('log-pass').value;
    try { await signInWithEmailAndPassword(auth, email, pass); } catch (e) { alert(e.message); }
};

document.getElementById('btn-logout').onclick = () => signOut(auth);
document.getElementById('to-login').onclick = () => { signupArea.classList.add('hidden'); loginArea.classList.remove('hidden'); };
document.getElementById('to-signup').onclick = () => { loginArea.classList.add('hidden'); signupArea.classList.remove('hidden'); };

const signupArea = document.getElementById('signup-area');
const loginArea = document.getElementById('login-area');

// --- NAVIGATION ---
const view = document.getElementById('app-view');
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderSection(btn.dataset.target);
    };
});

// --- RENDU DES SECTIONS ---
function renderSection(id) {
    view.innerHTML = "";
    if (id === 'agora') {
        view.innerHTML = `
            <div class="card">
                <div class="post-input-area">
                    <input type="text" id="post-text" placeholder="Quoi de neuf ?">
                    <button class="btn-primary" id="send-post" style="width:auto;margin:0;padding:0 15px">Publier</button>
                </div>
            </div>
            <div id="agora-feed"></div>`;
        
        document.getElementById('send-post').onclick = async () => {
            const txt = document.getElementById('post-text').value;
            if(!txt) return;
            await addDoc(collection(db, "posts"), {
                text: txt, author: currentUserData.name, role: currentUserData.role, date: Date.now()
            });
            document.getElementById('post-text').value = "";
        };

        const q = query(collection(db, "posts"), orderBy("date", "desc"));
        onSnapshot(q, (snap) => {
            const feed = document.getElementById('agora-feed');
            if(!feed) return;
            feed.innerHTML = "";
            snap.forEach(d => {
                const p = d.data();
                feed.innerHTML += `
                    <div class="card">
                        <div class="post-header"><div class="avatar-s" style="width:30px;height:30px;background:#ddd;border-radius:50%"></div> 
                        ${p.author} ${p.role === 'prof' ? '<span class="badge-prof">PROF</span>' : ''}</div>
                        <p>${p.text}</p>
                    </div>`;
            });
        });
    } else if (id === 'profile') {
        view.innerHTML = `
            <div class="profile-box">
                <div class="avatar-l"></div>
                <h2>${currentUserData.name}</h2>
                <p>${currentUserData.bio}</p>
                <div class="card" style="margin-top:20px">Paramètres du compte</div>
            </div>`;
    } else {
        view.innerHTML = `<div class="card">Section ${id} en cours de développement...</div>`;
    }
}