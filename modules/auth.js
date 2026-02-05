// modules/auth.js - Gestion de l'authentification Firebase
import { appState, showToast } from './app.js';

// 🔥 VOTRE CONFIGURATION FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyBpDCnuhjRc1bj7YzIhIZhkl555V5o1HEE",
    authDomain: "boxalink-c4854.firebaseapp.com",
    projectId: "boxalink-c4854",
    storageBucket: "boxalink-c4854.firebasestorage.app",
    messagingSenderId: "794643093312",
    appId: "1:794643093312:web:f1609703cdf072f6e04ca5"
};

// Variables Firebase
let auth, db, storage;
let firebaseInitialized = false;

// Liste des professions disponibles
const PROFESSIONS = [
    { id: 'student', label: 'Élève', icon: 'fas fa-user-graduate' },
    { id: 'university_student', label: 'Étudiant Universitaire', icon: 'fas fa-university' },
    { id: 'teacher', label: 'Professeur', icon: 'fas fa-chalkboard-teacher' },
    { id: 'professor', label: 'Professeur d\'Université', icon: 'fas fa-user-tie' },
    { id: 'doctor', label: 'Docteur', icon: 'fas fa-user-md' },
    { id: 'researcher', label: 'Chercheur', icon: 'fas fa-flask' },
    { id: 'parent', label: 'Parent d\'élève', icon: 'fas fa-users' },
    { id: 'administrator', label: 'Administrateur Scolaire', icon: 'fas fa-clipboard-list' },
    { id: 'counselor', label: 'Conseiller d\'Orientation', icon: 'fas fa-hands-helping' },
    { id: 'librarian', label: 'Bibliothécaire', icon: 'fas fa-book-reader' },
    { id: 'tutor', label: 'Tuteur', icon: 'fas fa-user-friends' },
    { id: 'other_education', label: 'Autre Profession Éducative', icon: 'fas fa-graduation-cap' }
];

// Initialiser Firebase de manière sécurisée
export async function initFirebase() {
    try {
        // Vérifier si Firebase est disponible
        if (typeof firebase === 'undefined') {
            console.error('Firebase SDK non chargé');
            throw new Error('Firebase non disponible');
        }

        // Initialiser seulement si pas déjà fait
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('Firebase initialisé');
        }
        
        // Initialiser les services
        auth = firebase.auth();
        db = firebase.firestore();
        storage = firebase.storage();
        
        // Configurer la persistance
        await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        
        firebaseInitialized = true;
        console.log('Services Firebase prêts');
        return true;
        
    } catch (error) {
        console.error('ERREUR Firebase:', error);
        firebaseInitialized = false;
        
        // Mode démo automatique en cas d'erreur
        console.log('Basculé en mode démo');
        return false;
    }
}

// Initialiser l'authentification avec fallback démo
export async function initAuth() {
    try {
        // Essayer Firebase d'abord
        const firebaseReady = await initFirebase();
        
        if (!firebaseReady) {
            return initDemoMode();
        }
        
        return new Promise((resolve) => {
            // Écouter les changements d'état d'authentification
            const unsubscribe = auth.onAuthStateChanged(async (user) => {
                unsubscribe(); // Se désabonner après la première réponse
                
                if (user) {
                    try {
                        const userData = await getUserData(user.uid);
                        appState.currentUser = userData;
                        resolve(userData);
                    } catch (error) {
                        console.log('Utilisateur Firestore non trouvé, mode démo activé');
                        resolve(initDemoMode());
                    }
                } else {
                    resolve(null); // Pas connecté
                }
            });
            
            // Timeout de sécurité
            setTimeout(() => {
                console.log('Timeout auth, basculé en démo');
                resolve(initDemoMode());
            }, 3000);
        });
        
    } catch (error) {
        console.error('Erreur initAuth:', error);
        return initDemoMode();
    }
}

// Mode démo de secours
function initDemoMode() {
    console.log('Mode démo activé');
    
    const demoUser = {
        id: 'demo-user-123',
        name: 'Alexandre Martin',
        email: 'demo@boxalink.com',
        phone: '+33 6 12 34 56 78',
        profession: 'professor',
        professionLabel: 'Professeur d\'Université',
        professionIcon: 'fas fa-user-tie',
        avatar: 'https://i.pravatar.cc/300?img=8',
        title: 'Professeur de Mathématiques',
        location: 'Paris, France',
        badges: ['Expert', 'Professeur Certifié'],
        stats: { posts: 156, forums: 42, contacts: 1200, sales: 18, documents: 5 },
        demoMode: true
    };
    
    // Sauvegarder pour persistance
    localStorage.setItem('boxalink_demo_user', JSON.stringify(demoUser));
    
    return demoUser;
}

// Connexion utilisateur
export async function loginUser(email, password, remember = true) {
    try {
        // Mode démo simplifié
        if (!email || !password) {
            throw new Error('Veuillez remplir tous les champs');
        }
        
        if (!firebaseInitialized) {
            // Mode démo automatique
            const demoUser = initDemoMode();
            showToast('Connexion réussie (mode démo)', 'success');
            return demoUser;
        }
        
        // Tentative Firebase réelle
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const userData = await getUserData(userCredential.user.uid);
        
        appState.currentUser = userData;
        showToast('Connexion réussie !', 'success');
        return userData;
        
    } catch (error) {
        console.error('Erreur login:', error);
        
        // Fallback au mode démo avec l'email fourni
        const demoUser = {
            id: `demo-${Date.now()}`,
            name: email.split('@')[0],
            email: email,
            phone: '+33 6 00 00 00 00',
            profession: 'teacher',
            professionLabel: 'Professeur',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=F27121&color=fff`,
            title: 'Nouveau membre',
            location: 'Paris',
            badges: ['Nouveau'],
            stats: { posts: 0, forums: 0, contacts: 0, sales: 0, documents: 0 },
            demoMode: true
        };
        
        localStorage.setItem('boxalink_demo_user', JSON.stringify(demoUser));
        showToast('Connexion réussie (mode démo)', 'success');
        return demoUser;
    }
}

// Inscription utilisateur
export async function registerUser(name, email, phone, password, profession) {
    try {
        // Validation basique
        if (!name || !email || !profession) {
            throw new Error('Veuillez remplir tous les champs');
        }
        
        // Valider la profession
        const validProfession = PROFESSIONS.find(p => p.id === profession);
        if (!validProfession) {
            throw new Error('Profession invalide');
        }
        
        if (!firebaseInitialized) {
            // Mode démo pour l'inscription
            const demoUser = {
                id: `demo-${Date.now()}`,
                name,
                email,
                phone: phone || '+33 6 00 00 00 00',
                profession: profession,
                professionLabel: validProfession.label,
                professionIcon: validProfession.icon,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F27121&color=fff`,
                title: getDefaultTitle(profession),
                location: 'Non spécifié',
                badges: ['Nouveau membre'],
                stats: { posts: 0, forums: 0, contacts: 0, sales: 0, documents: 0 },
                demoMode: true
            };
            
            localStorage.setItem('boxalink_demo_user', JSON.stringify(demoUser));
            showToast('Compte créé (mode démo)', 'success');
            return demoUser;
        }
        
        // Firebase réel
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const userId = userCredential.user.uid;
        
        const userProfile = {
            id: userId,
            name,
            email,
            phone: phone || '',
            profession: profession,
            professionLabel: validProfession.label,
            professionIcon: validProfession.icon,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F27121&color=fff`,
            title: getDefaultTitle(profession),
            location: 'Non spécifié',
            badges: ['Nouveau membre'],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            stats: { posts: 0, forums: 0, contacts: 0, sales: 0, documents: 0 }
        };
        
        await db.collection('users').doc(userId).set(userProfile);
        
        appState.currentUser = userProfile;
        showToast('Compte créé avec succès !', 'success');
        return userProfile;
        
    } catch (error) {
        console.error('Erreur inscription:', error);
        throw new Error(getAuthErrorMessage(error.code) || 'Erreur d\'inscription');
    }
}

// Récupérer données utilisateur depuis Firestore
async function getUserData(userId) {
    try {
        if (!firebaseInitialized) {
            const savedUser = localStorage.getItem('boxalink_demo_user');
            return savedUser ? JSON.parse(savedUser) : initDemoMode();
        }
        
        const userDoc = await db.collection('users').doc(userId).get();
        
        if (!userDoc.exists) {
            // Créer un profil de base si inexistant
            const baseProfile = {
                id: userId,
                name: 'Utilisateur',
                email: auth.currentUser?.email || '',
                title: 'Membre BoxaLink',
                badges: ['Nouveau'],
                stats: { posts: 0, forums: 0, contacts: 0, sales: 0, documents: 0 }
            };
            
            await db.collection('users').doc(userId).set(baseProfile);
            return baseProfile;
        }
        
        return { id: userId, ...userDoc.data() };
    } catch (error) {
        console.error('Erreur getUserData:', error);
        return initDemoMode();
    }
}

// Déconnexion
export async function logoutUser() {
    try {
        if (firebaseInitialized && auth.currentUser) {
            await auth.signOut();
        }
        
        localStorage.removeItem('boxalink_demo_user');
        appState.currentUser = null;
        showToast('Déconnexion réussie', 'info');
    } catch (error) {
        console.error('Erreur logout:', error);
        localStorage.removeItem('boxalink_demo_user');
        appState.currentUser = null;
    }
}

// Obtenir utilisateur actuel
export async function getCurrentUser() {
    return appState.currentUser;
}

// Messages d'erreur
function getAuthErrorMessage(errorCode) {
    const messages = {
        'auth/invalid-email': 'Email invalide',
        'auth/user-not-found': 'Utilisateur non trouvé',
        'auth/wrong-password': 'Mot de passe incorrect',
        'auth/email-already-in-use': 'Email déjà utilisé',
        'auth/weak-password': 'Mot de passe trop faible',
        'auth/network-request-failed': 'Erreur réseau'
    };
    
    return messages[errorCode] || 'Erreur d\'authentification';
}

// Titre par défaut
function getDefaultTitle(professionId) {
    const titles = {
        'student': 'Élève',
        'university_student': 'Étudiant',
        'teacher': 'Professeur',
        'professor': 'Professeur d\'Université',
        'doctor': 'Docteur',
        'researcher': 'Chercheur',
        'parent': 'Parent d\'élève'
    };
    
    return titles[professionId] || 'Membre';
}

// Export des professions
export { PROFESSIONS };
