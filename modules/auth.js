// modules/auth.js - Gestion de l'authentification
import { appState } from './app.js';

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDEMO_KEY_HERE_REPLACE_IN_PRODUCTION",
    authDomain: "boxalink-demo.firebaseapp.com",
    projectId: "boxalink-demo",
    storageBucket: "boxalink-demo.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};

// Initialiser Firebase (simulation pour la démo)
let firebaseApp;
let auth;
let db;
let storage;

export async function initFirebase() {
    try {
        // En production: firebaseApp = firebase.initializeApp(firebaseConfig);
        // Pour la démo, simuler Firebase
        console.log('Firebase initialisé (mode démo)');
        
        // Charger l'utilisateur depuis localStorage
        const savedUser = localStorage.getItem('boxalink_demo_user');
        if (savedUser) {
            return JSON.parse(savedUser);
        }
        
        return null;
    } catch (error) {
        console.error('Erreur Firebase:', error);
        return null;
    }
}

export async function initAuth() {
    if (appState.demoMode) {
        return initFirebase();
    }
    
    // Implémentation Firebase réelle ici
    // firebaseApp = firebase.initializeApp(firebaseConfig);
    // auth = firebase.auth();
    // db = firebase.firestore();
    // storage = firebase.storage();
    
    // return new Promise((resolve) => {
    //     auth.onAuthStateChanged((user) => {
    //         if (user) {
    //             // Récupérer les données utilisateur depuis Firestore
    //             resolve(getUserData(user.uid));
    //         } else {
    //             resolve(null);
    //         }
    //     });
    // });
    
    return null;
}

export async function loginUser(email, password, remember = true) {
    if (appState.demoMode) {
        throw new Error('Utilisez le mode démo ou configurez Firebase');
    }
    
    // Implémentation Firebase réelle
    // try {
    //     const userCredential = await auth.signInWithEmailAndPassword(email, password);
    //     const userData = await getUserData(userCredential.user.uid);
    //     
    //     if (remember) {
    //         // Configurer la persistance
    //         await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    //     }
    //     
    //     return userData;
    // } catch (error) {
    //     throw new Error(getAuthErrorMessage(error.code));
    // }
}

export async function registerUser(name, email, phone, password) {
    if (appState.demoMode) {
        throw new Error('Utilisez le mode démo ou configurez Firebase');
    }
    
    // Implémentation Firebase réelle
    // try {
    //     const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    //     
    //     // Créer le profil utilisateur dans Firestore
    //     await db.collection('users').doc(userCredential.user.uid).set({
    //         name,
    //         email,
    //         phone,
    //         avatar: `https://i.pravatar.cc/300?u=${email}`,
    //         title: 'Nouveau membre',
    //         location: 'Non spécifié',
    //         badges: ['Nouveau'],
    //         createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    //         stats: {
    //             posts: 0,
    //             forums: 0,
    //             contacts: 0,
    //             sales: 0
    //         }
    //     });
    //     
    //     return getUserData(userCredential.user.uid);
    // } catch (error) {
    //     throw new Error(getAuthErrorMessage(error.code));
    // }
}

export async function logoutUser() {
    if (appState.demoMode) {
        localStorage.removeItem('boxalink_demo_user');
        appState.currentUser = null;
        return;
    }
    
    // await auth.signOut();
}

export async function getCurrentUser() {
    return appState.currentUser;
}

export async function updateUserProfile(data) {
    if (appState.demoMode) {
        // Mettre à jour en mémoire et localStorage
        appState.currentUser = { ...appState.currentUser, ...data };
        localStorage.setItem('boxalink_demo_user', JSON.stringify(appState.currentUser));
        return appState.currentUser;
    }
    
    // Implémentation Firebase réelle
    // await db.collection('users').doc(appState.currentUser.id).update(data);
    // return getUserData(appState.currentUser.id);
}

async function getUserData(userId) {
    if (appState.demoMode) {
        return appState.currentUser;
    }
    
    // const doc = await db.collection('users').doc(userId).get();
    // return { id: userId, ...doc.data() };
}

function getAuthErrorMessage(errorCode) {
    const messages = {
        'auth/invalid-email': 'Email invalide',
        'auth/user-disabled': 'Compte désactivé',
        'auth/user-not-found': 'Utilisateur non trouvé',
        'auth/wrong-password': 'Mot de passe incorrect',
        'auth/email-already-in-use': 'Email déjà utilisé',
        'auth/weak-password': 'Mot de passe trop faible',
        'auth/operation-not-allowed': 'Opération non autorisée'
    };
    
    return messages[errorCode] || 'Erreur d\'authentification';
}
