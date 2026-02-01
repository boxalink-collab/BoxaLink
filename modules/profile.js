// modules/profile.js - Gestion du profil utilisateur
import { appState } from './app.js';
import { logoutUser } from './auth.js';
import { switchSection } from './app.js';

export function initProfile() {
    console.log('Module Profil initialisé');
}

export async function loadProfile() {
    const profileContainer = document.getElementById('profile-container');
    if (!profileContainer || !appState.currentUser) return;
    
    const user = appState.currentUser;
    
    profileContainer.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar">
                <img src="${user.avatar}" alt="${user.name}">
                <button class="edit-avatar">
                    <i class="fas fa-camera"></i>
                </button>
            </div>
            <h1 class="profile-name">${user.name}</h1>
            <p class="profile-title">${user.title}</p>
            <p class="profile-location">
                <i class="fas fa-map-marker-alt"></i> ${user.location}
            </p>
        </div>
        
        <div class="badges-section">
            <h3 class="section-title">
                <i class="fas fa-award"></i> Badges
            </h3>
            <div class="badges-list">
                ${user.badges.map(badge => `
                    <div class="profile-badge ${getBadgeClass(badge)}">
                        <i class="${getBadgeIcon(badge)}"></i>
                        <span>${badge}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="stats-section">
            <h3 class="section-title">
                <i class="fas fa-chart-line"></i> Statistiques
            </h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-value">${user.stats?.posts || 0}</span>
                    <span class="stat-label">Publications</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${user.stats?.forums || 0}</span>
                    <span class="stat-label">Forums</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${user.stats?.contacts || 0}</span>
                    <span class="stat-label">Contacts</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${user.stats?.sales || 0}</span>
                    <span class="stat-label">Ventes</span>
                </div>
            </div>
        </div>
        
        <div class="actions-section">
            <button class="action-item" id="edit-profile-btn">
                <i class="fas fa-user-edit"></i>
                <span>Modifier mon profil</span>
            </button>
            <button class="action-item" id="settings-btn">
                <i class="fas fa-cog"></i>
                <span>Paramètres</span>
            </button>
            <button class="action-item" id="privacy-btn">
                <i class="fas fa-shield-alt"></i>
                <span>Confidentialité</span>
            </button>
            <button class="action-item" id="help-btn">
                <i class="fas fa-question-circle"></i>
                <span>Aide & Support</span>
            </button>
            <button class="action-item logout" id="logout-profile-btn">
                <i class="fas fa-sign-out-alt"></i>
                <span>Déconnexion</span>
            </button>
        </div>
    `;
    
    // Ajouter les écouteurs d'événements
    initProfileEvents();
}

function getBadgeClass(badge) {
    const classes = {
        'Expert': 'badge-expert',
        'Professeur Certifié': 'badge-verified',
        'Contributeur Actif': 'badge-verified',
        'Nouveau': ''
    };
    return classes[badge] || '';
}

function getBadgeIcon(badge) {
    const icons = {
        'Expert': 'fas fa-star',
        'Professeur Certifié': 'fas fa-check-circle',
        'Contributeur Actif': 'fas fa-hands-helping',
        'Nouveau': 'fas fa-seedling'
    };
    return icons[badge] || 'fas fa-award';
}

function initProfileEvents() {
    // Bouton de déconnexion
    document.getElementById('logout-profile-btn')?.addEventListener('click', handleLogout);
    
    // Bouton d'édition de profil
    document.getElementById('edit-profile-btn')?.addEventListener('click', editProfile);
    
    // Bouton paramètres
    document.getElementById('settings-btn')?.addEventListener('click', openSettings);
    
    // Bouton confidentialité
    document.getElementById('privacy-btn')?.addEventListener('click', openPrivacy);
    
    // Bouton aide
    document.getElementById('help-btn')?.addEventListener('click', openHelp);
    
    // Bouton édition avatar
    document.querySelector('.edit-avatar')?.addEventListener('click', editAvatar);
}

async function handleLogout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        try {
            await logoutUser();
            
            // Rediriger vers l'écran d'authentification
            window.location.reload();
        } catch (error) {
            console.error('Erreur de déconnexion:', error);
            alert('Erreur lors de la déconnexion');
        }
    }
}

function editProfile() {
    showToast('Édition du profil', 'info');
    
    // En production: ouvrir un modal d'édition
    const newName = prompt('Nouveau nom:', appState.currentUser.name);
    const newTitle = prompt('Nouveau titre:', appState.currentUser.title);
    const newLocation = prompt('Nouvelle localisation:', appState.currentUser.location);
    
    if (newName || newTitle || newLocation) {
        // Mettre à jour le profil
        const updates = {};
        if (newName) updates.name = newName;
        if (newTitle) updates.title = newTitle;
        if (newLocation) updates.location = newLocation;
        
        // En production: appeler updateUserProfile(updates)
        appState.currentUser = { ...appState.currentUser, ...updates };
        
        // Recharger le profil
        loadProfile();
        showToast('Profil mis à jour', 'success');
    }
}

function editAvatar() {
    showToast('Changement de photo de profil', 'info');
    
    // En production: ouvrir un sélecteur de fichiers
    const avatarUrl = prompt('URL de la nouvelle photo de profil:', appState.currentUser.avatar);
    
    if (avatarUrl) {
        appState.currentUser.avatar = avatarUrl;
        loadProfile();
        showToast('Photo de profil mise à jour', 'success');
    }
}

function openSettings() {
    showToast('Ouverture des paramètres', 'info');
    alert('Paramètres de BoxaLink\n\nFonctionnalité complète à implémenter');
}

function openPrivacy() {
    showToast('Confidentialité et sécurité', 'info');
    alert('Paramètres de confidentialité\n\nFonctionnalité complète à implémenter');
}

function openHelp() {
    showToast('Aide et support', 'info');
    alert('Centre d\'aide BoxaLink\n\nEmail: support@boxalink.com\nTél: +33 1 23 45 67 89');
}

function showToast(message, type) {
    console.log(`${type}: ${message}`);
}

export async function updateUserStats(stats) {
    // Mettre à jour les statistiques utilisateur
    if (appState.currentUser) {
        appState.currentUser.stats = { ...appState.currentUser.stats, ...stats };
        await loadProfile();
    }
}
