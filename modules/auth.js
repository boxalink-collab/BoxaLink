// modules/auth.js - Gestion de l'authentification Firebase
import { appState, switchSection, showToast } from './app.js';

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
let firebaseApp;
let auth;
let db;
let storage;

// Liste des professions disponibles dans l'enseignement
const PROFESSIONS = [
    { id: 'student', label: 'Élève', icon: 'fas fa-user-graduate' },
    { id: 'university_student', label: 'Étudiant Universitaire', icon: 'fas fa-university' },
    { id: 'teacher', label: 'Professeur (Primaire/Secondaire)', icon: 'fas fa-chalkboard-teacher' },
    { id: 'professor', label: 'Professeur d\'Université', icon: 'fas fa-user-tie' },
    { id: 'doctor', label: 'Docteur', icon: 'fas fa-user-md' },
    { id: 'researcher', label: 'Chercheur', icon: 'fas fa-flask' },
    { id: 'parent', label: 'Parent d\'élève', icon: 'fas fa-users' },
    { id: 'administrator', label: 'Administrateur Scolaire', icon: 'fas fa-clipboard-list' },
    { id: 'counselor', label: 'Conseiller d\'Orientation', icon: 'fas fa-hands-helping' },
    { id: 'librarian', label: 'Bibliothécaire', icon: 'fas fa-book-reader' },
    { id: 'tutor', label: 'Tuteur/Professeur Particulier', icon: 'fas fa-user-friends' },
    { id: 'other_education', label: 'Autre Profession Éducative', icon: 'fas fa-graduation-cap' }
];

// Initialiser Firebase
export async function initFirebase() {
    try {
        if (!firebase.apps.length) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
        } else {
            firebaseApp = firebase.apps[0];
        }
        
        auth = firebase.auth();
        db = firebase.firestore();
        storage = firebase.storage();
        
        console.log('Firebase initialisé avec succès');
        
        // Configurer la persistance
        await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        
        return true;
    } catch (error) {
        console.error('Erreur d\'initialisation Firebase:', error);
        throw error;
    }
}

// Initialiser l'authentification
export async function initAuth() {
    try {
        await initFirebase();
        
        return new Promise((resolve) => {
            auth.onAuthStateChanged(async (user) => {
                if (user) {
                    // Récupérer les données utilisateur depuis Firestore
                    const userData = await getUserData(user.uid);
                    appState.currentUser = userData;
                    resolve(userData);
                } else {
                    resolve(null);
                }
            });
        });
    } catch (error) {
        console.error('Erreur d\'authentification:', error);
        return null;
    }
}

// Connexion utilisateur
export async function loginUser(email, password, remember = true) {
    try {
        if (!email || !password) {
            throw new Error('Veuillez remplir tous les champs');
        }
        
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const userData = await getUserData(userCredential.user.uid);
        
        appState.currentUser = userData;
        
        if (remember) {
            await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        }
        
        showToast('Connexion réussie !', 'success');
        return userData;
    } catch (error) {
        console.error('Erreur de connexion:', error);
        throw new Error(getAuthErrorMessage(error.code));
    }
}

// Inscription utilisateur
export async function registerUser(name, email, phone, password, profession, additionalData = {}) {
    try {
        if (!name || !email || !phone || !password || !profession) {
            throw new Error('Veuillez remplir tous les champs obligatoires');
        }
        
        if (password.length < 6) {
            throw new Error('Le mot de passe doit contenir au moins 6 caractères');
        }
        
        // Valider la profession
        const validProfession = PROFESSIONS.find(p => p.id === profession);
        if (!validProfession) {
            throw new Error('Profession invalide');
        }
        
        // Créer l'utilisateur
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const userId = userCredential.user.uid;
        
        // Préparer les données du profil
        const userProfile = {
            id: userId,
            name,
            email,
            phone,
            profession: profession,
            professionLabel: validProfession.label,
            professionIcon: validProfession.icon,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F27121&color=fff&size=256`,
            title: getDefaultTitle(profession),
            location: 'Non spécifié',
            badges: ['Nouveau membre'],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            stats: {
                posts: 0,
                forums: 0,
                contacts: 0,
                sales: 0,
                documents: 0
            },
            ...additionalData
        };
        
        // Créer le profil dans Firestore
        await db.collection('users').doc(userId).set(userProfile);
        
        // Créer le sous-document pour les préférences
        await db.collection('users').doc(userId).collection('preferences').doc('settings').set({
            notifications: true,
            emailNotifications: true,
            darkMode: true,
            language: 'fr'
        });
        
        appState.currentUser = userProfile;
        
        showToast('Compte créé avec succès ! Bienvenue sur BoxaLink', 'success');
        return userProfile;
    } catch (error) {
        console.error('Erreur d\'inscription:', error);
        throw new Error(getAuthErrorMessage(error.code));
    }
}

// Récupérer les données utilisateur
export async function getUserData(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        
        if (!userDoc.exists) {
            throw new Error('Profil utilisateur non trouvé');
        }
        
        return {
            id: userId,
            ...userDoc.data()
        };
    } catch (error) {
        console.error('Erreur de récupération des données:', error);
        throw error;
    }
}

// Mettre à jour le profil utilisateur
export async function updateUserProfile(userId, data) {
    try {
        await db.collection('users').doc(userId).update({
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Mettre à jour l'état local
        if (appState.currentUser && appState.currentUser.id === userId) {
            appState.currentUser = { ...appState.currentUser, ...data };
        }
        
        showToast('Profil mis à jour', 'success');
        return appState.currentUser;
    } catch (error) {
        console.error('Erreur de mise à jour:', error);
        throw error;
    }
}

// Déconnexion
export async function logoutUser() {
    try {
        await auth.signOut();
        appState.currentUser = null;
        showToast('Déconnexion réussie', 'info');
    } catch (error) {
        console.error('Erreur de déconnexion:', error);
        throw error;
    }
}

// Récupérer l'utilisateur actuel
export async function getCurrentUser() {
    return appState.currentUser;
}

// Réinitialiser le mot de passe
export async function resetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        showToast('Email de réinitialisation envoyé', 'success');
        return true;
    } catch (error) {
        console.error('Erreur de réinitialisation:', error);
        throw new Error(getAuthErrorMessage(error.code));
    }
}

// Gestion des erreurs d'authentification
function getAuthErrorMessage(errorCode) {
    const messages = {
        // Erreurs de connexion
        'auth/invalid-email': 'Adresse email invalide',
        'auth/user-disabled': 'Ce compte a été désactivé',
        'auth/user-not-found': 'Aucun compte trouvé avec cet email',
        'auth/wrong-password': 'Mot de passe incorrect',
        
        // Erreurs d'inscription
        'auth/email-already-in-use': 'Cette adresse email est déjà utilisée',
        'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères',
        'auth/operation-not-allowed': 'L\'inscription par email est désactivée',
        
        // Erreurs générales
        'auth/network-request-failed': 'Erreur réseau. Vérifiez votre connexion',
        'auth/too-many-requests': 'Trop de tentatives. Veuillez réessayer plus tard',
        'auth/requires-recent-login': 'Veuillez vous reconnecter pour effectuer cette action'
    };
    
    return messages[errorCode] || 'Une erreur est survenue. Veuillez réessayer';
}

// Obtenir le titre par défaut selon la profession
function getDefaultTitle(professionId) {
    const titles = {
        'student': 'Élève',
        'university_student': 'Étudiant',
        'teacher': 'Professeur',
        'professor': 'Professeur d\'Université',
        'doctor': 'Docteur',
        'researcher': 'Chercheur',
        'parent': 'Parent d\'élève',
        'administrator': 'Administrateur',
        'counselor': 'Conseiller',
        'librarian': 'Bibliothécaire',
        'tutor': 'Tuteur',
        'other_education': 'Professionnel de l\'éducation'
    };
    
    return titles[professionId] || 'Membre BoxaLink';
}

// Obtenir la liste des professions pour l'interface
export function getProfessionsList() {
    return PROFESSIONS;
}

// Vérifier si l'email existe déjà
export async function checkEmailExists(email) {
    try {
        const methods = await auth.fetchSignInMethodsForEmail(email);
        return methods.length > 0;
    } catch (error) {
        console.error('Erreur de vérification email:', error);
        return false;
    }
}

// Mettre à jour l'avatar
export async function updateAvatar(userId, imageFile) {
    try {
        // Télécharger l'image vers Firebase Storage
        const storageRef = storage.ref();
        const avatarRef = storageRef.child(`avatars/${userId}/${Date.now()}_${imageFile.name}`);
        
        // Upload de l'image
        await avatarRef.put(imageFile);
        
        // Obtenir l'URL de l'image
        const avatarUrl = await avatarRef.getDownloadURL();
        
        // Mettre à jour le profil
        await updateUserProfile(userId, { avatar: avatarUrl });
        
        showToast('Photo de profil mise à jour', 'success');
        return avatarUrl;
    } catch (error) {
        console.error('Erreur de mise à jour de l\'avatar:', error);
        throw error;
    }
}

// Export des constantes pour l'interface
export { PROFESSIONS };
