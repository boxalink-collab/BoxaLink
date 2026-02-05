// modules/app.js - Module principal de l'application

import { initAuth, loginUser, registerUser, logoutUser, getCurrentUser } from './auth.js';
import { loadChats, initChats } from './chats.js';
import { loadPosts, initAgora } from './agora.js';
import { loadForums, initForums } from './forums.js';
import { loadDocuments, initLibrary } from './library.js';
import { loadProducts, initMarket } from './market.js';
import { loadProfile, initProfile } from './profile.js';

// État global de l'application
export const appState = {
    currentUser: null,
    currentSection: 'chats-section',
    searchActive: false,
    notifications: [],
    isLoading: false,
    demoMode: true
};

// Initialisation de l'application
export async function initApp() {
    console.log('🚀 Initialisation BoxaLink...');
    
    // Masquer l'écran de chargement après 2s max
    const loadingTimeout = setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        showAuthScreen();
    }, 2000);
    
    try {
        initEventListeners();
        const user = await initAuth();
        
        clearTimeout(loadingTimeout);
        
        if (user) {
            appState.currentUser = user;
            showMainApp();
            loadCurrentSection();
        } else {
            showAuthScreen();
        }
    } catch (error) {
        console.error('Erreur initApp:', error);
        clearTimeout(loadingTimeout);
        showAuthScreen();
    }
}
    
    // Initialiser les écouteurs d'événements
    initEventListeners();
    
    // Initialiser l'authentification
    const user = await initAuth();
    
    if (user) {
        appState.currentUser = user;
        showMainApp();
        loadCurrentSection();
    } else {
        showAuthScreen();
    }
}

// Gestion des événements
function initEventListeners() {
    // Navigation tabs
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            switchSection(section);
        });
    });
    
    // Auth tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            switchAuthTab(tabId);
        });
    });
    
    // Login/Register buttons
    document.getElementById('login-btn')?.addEventListener('click', handleLogin);
    document.getElementById('register-btn')?.addEventListener('click', handleRegister);
    
    // Search
    document.getElementById('search-btn')?.addEventListener('click', toggleSearch);
    document.getElementById('close-search')?.addEventListener('click', toggleSearch);
    
    // Notifications
    document.getElementById('notif-btn')?.addEventListener('click', showNotifications);
    document.getElementById('close-notifications')?.addEventListener('click', hideNotifications);
    
    // New chat/post buttons
    document.getElementById('new-chat-btn')?.addEventListener('click', createNewChat);
    document.getElementById('new-post-btn')?.addEventListener('click', createNewPost);
}

// Gestion des sections
export function switchSection(sectionId) {
    // Mettre à jour l'état
    appState.currentSection = sectionId;
    
    // Mettre à jour la navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionId);
    });
    
    // Mettre à jour le titre
    const titles = {
        'chats-section': 'Chats',
        'agora-section': 'Agora',
        'forums-section': 'Forums',
        'library-section': 'Bibliothèque',
        'market-section': 'Market',
        'profile-section': 'Profil'
    };
    
    document.getElementById('header-title').textContent = titles[sectionId] || 'BoxaLink';
    
    // Cacher/Afficher les sections
    document.querySelectorAll('.tab-content').forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });
    
    // Charger le contenu de la section
    loadSectionContent(sectionId);
}

// Charger le contenu de la section
function loadSectionContent(sectionId) {
    switch(sectionId) {
        case 'chats-section':
            loadChats();
            break;
        case 'agora-section':
            loadPosts();
            break;
        case 'forums-section':
            loadForums();
            break;
        case 'library-section':
            loadDocuments();
            break;
        case 'market-section':
            loadProducts();
            break;
        case 'profile-section':
            loadProfile();
            break;
    }
}

// Gestion de l'authentification
function switchAuthTab(tabId) {
    // Mettre à jour les tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabId);
    });
    
    // Mettre à jour les formulaires
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.toggle('active', form.id === `${tabId}-form`);
    });
}

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const remember = document.getElementById('remember-login').checked;
    
    if (!email || !password) {
        showToast('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    try {
        appState.isLoading = true;
        showLoading();
        
        // En mode démo, utiliser les données de démo
        if (appState.demoMode) {
            await demoLogin();
        } else {
            await loginUser(email, password, remember);
        }
        
        showMainApp();
        loadCurrentSection();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        appState.isLoading = false;
        hideLoading();
    }
}

async function handleRegister() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    
    // Validation
    if (!name || !email || !phone || !password || !confirm) {
        showToast('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    if (password !== confirm) {
        showToast('Les mots de passe ne correspondent pas', 'error');
        return;
    }
    
    try {
        appState.isLoading = true;
        showLoading();
        
        await registerUser(name, email, phone, password);
        
        showToast('Compte créé avec succès !', 'success');
        switchAuthTab('login');
        
        // Pré-remplir le formulaire de connexion
        document.getElementById('login-email').value = email;
        document.getElementById('login-password').value = password;
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        appState.isLoading = false;
        hideLoading();
    }
}

// Fonction de démo
async function demoLogin() {
    // Simuler un délai de connexion
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Créer un utilisateur de démo
    appState.currentUser = {
        id: 'demo-user-123',
        name: 'Alexandre Martin',
        email: 'demo@boxalink.com',
        phone: '+33 6 12 34 56 78',
        avatar: 'https://i.pravatar.cc/300?img=8',
        title: 'Professeur de Mathématiques',
        location: 'Paris, France',
        badges: ['Expert', 'Professeur Certifié'],
        stats: {
            posts: 156,
            forums: 42,
            contacts: 1200,
            sales: 18
        }
    };
    
    // Sauvegarder en localStorage pour la persistance
    localStorage.setItem('boxalink_demo_user', JSON.stringify(appState.currentUser));
    
    showToast('Connexion réussie en mode démo', 'success');
}

// Gestion de l'UI
function showLoading() {
    document.getElementById('loading-screen').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-screen').style.display = 'none';
}

function showAuthScreen() {
    document.getElementById('auth-screen').style.display = 'block';
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('loading-screen').style.display = 'none';
}

function showMainApp() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'flex';
    document.getElementById('loading-screen').style.display = 'none';
}

function toggleSearch() {
    const searchBar = document.getElementById('search-bar');
    appState.searchActive = !appState.searchActive;
    searchBar.classList.toggle('hidden', !appState.searchActive);
    
    if (appState.searchActive) {
        document.getElementById('search-input').focus();
    }
}

function showNotifications() {
    document.getElementById('notifications-overlay').classList.remove('hidden');
}

function hideNotifications() {
    document.getElementById('notifications-overlay').classList.add('hidden');
}

function createNewChat() {
    showToast('Nouvelle conversation', 'info');
    // Implémenter la logique de création de chat
}

function createNewPost() {
    showToast('Nouvelle publication', 'info');
    // Implémenter la logique de création de post
}

function showToast(message, type = 'info') {
    // Créer un toast temporaire
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Styles du toast
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.background = type === 'error' ? '#FF4757' : 
                            type === 'success' ? '#2ED573' : 
                            type === 'warning' ? '#FFB800' : 
                            'var(--blue)';
    toast.style.color = 'white';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.zIndex = '9999';
    toast.style.animation = 'fadeIn 0.3s ease';
    
    document.body.appendChild(toast);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function loadCurrentSection() {
    loadSectionContent(appState.currentSection);
}

// Initialiser l'application au chargement
window.addEventListener('DOMContentLoaded', initApp);
