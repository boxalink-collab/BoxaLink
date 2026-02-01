// modules/forums.js - Gestion des forums communautaires
import { appState } from './app.js';

export function initForums() {
    console.log('Module Forums initialisé');
}

export async function loadForums() {
    const forumsList = document.getElementById('forums-list');
    if (!forumsList) return;
    
    // Données de démo
    const demoForums = [
        {
            id: 'forum1',
            name: 'Club Scientifique',
            description: 'Échanges et collaborations sur la recherche scientifique',
            members: 2450,
            color: '#F27121',
            icon: 'fas fa-flask',
            joined: true
        },
        {
            id: 'forum2',
            name: 'Croix-Rouge',
            description: 'Bénévolat et actions humanitaires',
            members: 1800,
            color: '#FF4757',
            icon: 'fas fa-heart',
            joined: false
        },
        {
            id: 'forum3',
            name: 'Développeurs Web',
            description: 'Partage de connaissances en développement web',
            members: 3200,
            color: '#1271FF',
            icon: 'fas fa-code',
            joined: true
        },
        {
            id: 'forum4',
            name: 'Étudiants en Médecine',
            description: 'Entraide et partage pour les études médicales',
            members: 1500,
            color: '#2ED573',
            icon: 'fas fa-stethoscope',
            joined: false
        },
        {
            id: 'forum5',
            name: 'Artistes Contemporains',
            description: 'Galerie virtuelle et discussions artistiques',
            members: 950,
            color: '#8A2387',
            icon: 'fas fa-palette',
            joined: true
        }
    ];
    
    // Vider la liste
    forumsList.innerHTML = '';
    
    // Ajouter chaque forum
    demoForums.forEach(forum => {
        const forumElement = createForumElement(forum);
        forumsList.appendChild(forumElement);
    });
}

function createForumElement(forum) {
    const div = document.createElement('div');
    div.className = 'forum-item';
    div.dataset.forumId = forum.id;
    
    const joinClass = forum.joined ? 'joined' : '';
    const joinText = forum.joined ? 'Quitter' : 'Rejoindre';
    
    div.innerHTML = `
        <div class="forum-icon" style="background-color: ${forum.color};">
            <i class="${forum.icon}"></i>
        </div>
        <div class="forum-info">
            <h4>${forum.name}</h4>
            <p>${forum.description}</p>
            <div class="forum-meta">
                <span class="forum-members">
                    <i class="fas fa-users"></i> ${forum.members.toLocaleString()} membres
                </span>
            </div>
        </div>
        <button class="join-btn ${joinClass}">${joinText}</button>
    `;
    
    // Ajouter l'événement pour le bouton rejoindre/quitter
    const joinBtn = div.querySelector('.join-btn');
    joinBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleForumJoin(forum, joinBtn);
    });
    
    // Ajouter l'événement pour ouvrir le forum
    div.addEventListener('click', () => openForum(forum));
    
    return div;
}

function toggleForumJoin(forum, button) {
    forum.joined = !forum.joined;
    
    if (forum.joined) {
        button.textContent = 'Quitter';
        button.classList.add('joined');
        showToast(`Vous avez rejoint ${forum.name}`, 'success');
    } else {
        button.textContent = 'Rejoindre';
        button.classList.remove('joined');
        showToast(`Vous avez quitté ${forum.name}`, 'info');
    }
}

function openForum(forum) {
    console.log('Ouverture du forum:', forum.name);
    alert(`Forum: ${forum.name}\n${forum.description}\n\nFonctionnalité complète à implémenter`);
}

function showToast(message, type) {
    // Implémentation simple de toast
    alert(`${type.toUpperCase()}: ${message}`);
}

export async function joinForum(forumId) {
    // Rejoindre un forum
    return { success: true };
}

export async function leaveForum(forumId) {
    // Quitter un forum
    return { success: true };
}
