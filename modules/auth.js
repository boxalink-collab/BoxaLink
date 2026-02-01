import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

export function initAuth(auth, db) {
    const overlay = document.getElementById('auth-overlay');
    overlay.innerHTML = `
        <div class="auth-card">
            <h1 class="logo">Boxa<span>Link</span></h1>
            <div id="signup-form">
                <input type="text" id="reg-name" placeholder="Nom complet">
                <input type="email" id="reg-email" placeholder="Email">
                <select id="reg-role">
                    <option value="" disabled selected>Votre fonction...</option>
                    <optgroup label="Apprenants"><option value="Élève">Élève</option><option value="Étudiant">Étudiant</option></optgroup>
                    <optgroup label="Enseignants"><option value="Professeur">Professeur</option><option value="Formateur">Formateur</option></optgroup>
                    <optgroup label="Famille"><option value="Parent">Parent d'élève</option></optgroup>
                </select>
                <input type="password" id="reg-pass" placeholder="Mot de passe">
                <input type="password" id="reg-conf" placeholder="Confirmer mot de passe">
                <button class="btn-primary" id="do-signup">S'inscrire</button>
                <p class="toggle-link" id="to-login">Déjà inscrit ? Connexion</p>
            </div>
            <div id="login-form" class="hidden">
                <input type="email" id="log-email" placeholder="Email">
                <input type="password" id="log-pass" placeholder="Mot de passe">
                <button class="btn-primary" id="do-login">Se connecter</button>
                <p class="toggle-link" id="to-signup">Nouveau ? S'inscrire</p>
            </div>
        </div>
    `;

    document.getElementById('to-login').onclick = () => {
        document.getElementById('signup-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
    };

    document.getElementById('to-signup').onclick = () => {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('signup-form').classList.remove('hidden');
    };

    document.getElementById('do-signup').onclick = async () => {
        const email = document.getElementById('reg-email').value;
        const pass = document.getElementById('reg-pass').value;
        const conf = document.getElementById('reg-conf').value;
        const name = document.getElementById('reg-name').value;
        const role = document.getElementById('reg-role').value;

        if(pass !== conf) return alert("Mots de passe différents");

        try {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, "users", res.user.uid), { name, role, email, uid: res.user.uid });
        } catch(e) { alert(e.message); }
    };

    document.getElementById('do-login').onclick = async () => {
        const email = document.getElementById('log-email').value;
        const pass = document.getElementById('log-pass').value;
        try { await signInWithEmailAndPassword(auth, email, pass); } catch(e) { alert(e.message); }
    };
}
