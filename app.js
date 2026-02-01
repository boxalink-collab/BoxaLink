import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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
let userProfile = null;

// --- AUTHENTIFICATION ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const d = await getDoc(doc(db, "users", user.uid));
        userProfile = d.data();
        document.getElementById('auth-overlay').classList.add('hidden');
        renderSection('agora');
    } else {
        document.getElementById('auth-overlay').classList.remove('hidden');
    }
});

document.getElementById('btn-signup').onclick = async () => {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const role = document.getElementById('reg-role').value;
    const pass = document.getElementById('reg-pass').value;
    const conf = document.getElementById('reg-pass-conf').value;

    if(pass !== conf) return alert("Les mots de passe ne correspondent pas !");
    try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        await setDoc(doc(db, "users", res.user.uid), { name, email, role, uid: res.user.uid, bio: "Étudiant BoxaLink" });
    } catch(e) { alert(e.message); }
};

document.getElementById('btn-login').onclick = async () => {
    const email = document.getElementById('log-email').value;
    const pass = document.getElementById('log-pass').value;
    try { await signInWithEmailAndPassword(auth, email, pass); } catch(e) { alert(e.message); }
};

document.getElementById('btn-logout').onclick = () => signOut(auth);

// --- NAVIGATION ---
const view = document.getElementById('app-view');
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderSection(btn.dataset.target);
    };
});

function renderSection(id) {
    view.innerHTML = "";
    
    // BOUTON ACTION FLOTTANT (+)
    const fab = document.createElement('button');
    fab.className = 'fab';
    fab.innerHTML = '<i class="fas fa-plus"></i>';
    view.appendChild(fab);

    if (id === 'agora') {
        view.innerHTML += `<div class="card"><input type="text" class="post-input" placeholder="Partagez quelque chose, ${userProfile.name}..."></div><div id="feed"></div>`;
        loadPosts('posts', 'feed');
    } 
    else if (id === 'chats') {
        view.innerHTML += `<div class="card"><h3>Messages récents</h3><p style="color:gray">Accédez à vos contacts pour démarrer une discussion.</p></div>`;
        fab.onclick = async () => {
            try {
                const contacts = await navigator.contacts.select(['name', 'tel'], {multiple: true});
                if(contacts.length) alert("Discussion démarrée avec " + contacts[0].name);
            } catch {
                if(confirm("Accès répertoire non supporté sur ce navigateur. Inviter un ami ?")) {
                    window.location.href = "sms:?body=Rejoins BoxaLink!";
                }
            }
        };
    }
    else if (id === 'forums') {
        view.innerHTML += `<div class="card"><h3>Groupes & Forums</h3><button class="btn-primary" style="padding:5px">Créer un groupe</button></div><div id="groups-feed"></div>`;
        loadPosts('groups', 'groups-feed');
    }
    else if (id === 'profile') {
        view.innerHTML = `
            <div class="card" style="text-align:center">
                <div style="width:80px;height:80px;background:#ddd;border-radius:50%;margin:0 auto 10px"></div>
                <h2>${userProfile.name}</h2>
                <span class="badge">${userProfile.role}</span>
                <p style="margin-top:10px">${userProfile.bio}</p>
                <button class="btn-primary" style="background:#eee;color:black;margin-top:15px">Modifier le niveau/profil</button>
            </div>`;
    }
}

function loadPosts(coll, containerId) {
    const q = query(collection(db, coll), orderBy("date", "desc"));
    onSnapshot(q, (snap) => {
        const cont = document.getElementById(containerId);
        if(!cont) return;
        cont.innerHTML = "";
        snap.forEach(d => {
            const p = d.data();
            cont.innerHTML += `<div class="card"><strong>${p.author}</strong> <small>${p.role}</small><p>${p.text}</p></div>`;
        });
    });
}
