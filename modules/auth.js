import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

export function initAuth(auth, db) {
    const overlay = document.getElementById('auth-overlay');
    
    overlay.innerHTML = `
        <div class="auth-card">
            <h1 class="logo">Boxa<span>Link</span></h1>
            <p class="slogan">Le réseau de l'excellence éducative</p>

            <div id="signup-form">
                <h3>Créer un compte</h3>
                <input type="text" id="reg-name" placeholder="Nom complet">
                <input type="email" id="reg-email" placeholder="Email">
                
                <select id="reg-role">
                    <option value="" disabled selected>Quelle est votre fonction ?</option>
                    <optgroup label="Apprenants">
                        <option value="Élève">Élève</option>
                        <option value="Étudiant">Étudiant</option>
                        <option value="Doctorant">Doctorant / Chercheur</option>
                    </optgroup>
                    <optgroup label="Enseignants">
                        <option value="Instituteur">Instituteur / Institutrice</option>
                        <option value="Professeur">Professeur (Collège/Lycée)</option>
                        <option value="Enseignant-Chercheur">Enseignant-Chercheur (Université)</option>
                        <option value="Formateur">Formateur / Coach</option>
                    </optgroup>
                    <optgroup label="Administration & Famille">
                        <option value="Parent d'élève">Parent d'élève</option>
                        <option value="Directeur/Proviseur">Direction / Administration</option>
                        <option value="Inspecteur">Inspecteur de l'éducation</option>
                        <option value="Conseiller d'orientation">Conseiller d'orientation</option>
                    </optgroup>
                    <optgroup label="Autres">
                        <option value="Professionnel">Professionnel en activité</option>
                        <option value="Autodidacte">Autodidacte / Passionné</option>
                    </optgroup>
                </select>

                <input type="password" id="reg-pass" placeholder="Mot de passe">
                <input type="password" id="reg-conf" placeholder="Confirmer le mot de passe">
                <button class="btn-primary" id="do-signup">S'inscrire</button>
                <p class="toggle-link" id="go-to-login">Déjà inscrit ? Se connecter</p>
            </div>

            <div id="login-form" class="hidden">
                <h3>Bon retour</h3>
                <input type="email" id="log-email" placeholder="Email">
                <input type="password" id="log-pass" placeholder="Mot de passe">
                <button class="btn-primary" id="do-login">Se connecter</button>
                <p class="toggle-link" id="go-to-signup">Nouveau ici ? Créer un compte</p>
            </div>
        </div>
    `;

    // --- LOGIQUE DE BASCULE ---
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');

    document.getElementById('go-to-login').onclick = () => {
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    };

    document.getElementById('go-to-signup').onclick = () => {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    };

    // --- ACTION D'INSCRIPTION ---
    document.getElementById('do-signup').onclick = async () => {
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const role = document.getElementById('reg-role').value;
        const pass = document.getElementById('reg-pass').value;
        const conf = document.getElementById('reg-conf').value;

        if (!name || !email || !role || !pass) return alert("Veuillez remplir tous les champs");
        if (pass !== conf) return alert("Les mots de passe ne correspondent pas");

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: name,
                email: email,
                role: role,
                bio: `Membre de BoxaLink en tant que ${role}`,
                createdAt: new Date()
            });
            
            alert("Compte " + role + " créé avec succès !");
        } catch (error) {
            alert("Erreur : " + error.message);
        }
    };

    // --- ACTION DE CONNEXION ---
    document.getElementById('do-login').onclick = async () => {
        const email = document.getElementById('log-email').value;
        const pass = document.getElementById('log-pass').value;
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (error) {
            alert("Échec de connexion : " + error.message);
        }
    };
}
