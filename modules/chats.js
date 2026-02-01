// modules/chats.js - Gestion des chats (style WhatsApp)
import { appState } from './app.js';

export function initChats() {
    console.log('Module Chats initialisé');
}

export async function loadChats() {
    const chatsList = document.getElementById('chats-list');
    if (!chatsList) return;
    
    // Données de démo
    const demoChats = [
        {
            id: 'chat1',
            name: 'Club Scientifique',
            avatar: 'https://i.pravatar.cc/300?img=11',
            lastMessage: 'Réunion demain à 18h sur le nouveau projet',
            time: '10:30',
            unread: 3,
            online: true,
            isGroup: true
        },
        {
            id: 'chat2',
            name: 'Marie Dubois',
            avatar: 'https://i.pravatar.cc/300?img=5',
            lastMessage: 'Merci pour le document, c\'est exactement ce qu\'il me fallait !',
            time: '09:15',
            unread: 0,
            online: true,
            isGroup: false
        },
        {
            id: 'chat3',
            name: 'Thomas Leroy',
            avatar: 'https://i.pravatar.cc/300?img=2',
            lastMessage: 'Je t\'envoie les notes du cours d\'aujourd\'hui',
            time: 'Hier',
            unread: 1,
            online: false,
            isGroup: false
        },
        {
            id: 'chat4',
            name: 'Groupe Projet IA',
            avatar: 'https://i.pravatar.cc/300?img=13',
            lastMessage: 'Sophie: J\'ai terminé la partie sur les algorithmes',
            time: 'Hier',
            unread: 12,
            online: true,
            isGroup: true
        },
        {
            id: 'chat5',
            name: 'Support BoxaLink',
            avatar: 'https://i.pravatar.cc/300?img=20',
            lastMessage: 'Votre demande a été traitée avec succès',
            time: '12/05',
            unread: 0,
            online: false,
            isGroup: false
        },
        {
            id: 'chat6',
            name: 'Équipe Développement',
            avatar: 'https://i.pravatar.cc/300?img=25',
            lastMessage: 'Réunion code review à 14h',
            time: '11/05',
            unread: 0,
            online: true,
            isGroup: true
        }
    ];
    
    // Vider la liste
    chatsList.innerHTML = '';
    
    // Ajouter chaque chat
    demoChats.forEach(chat => {
        const chatElement = createChatElement(chat);
        chatsList.appendChild(chatElement);
    });
}

function createChatElement(chat) {
    const div = document.createElement('div');
    div.className = 'chat-item';
    div.dataset.chatId = chat.id;
    
    const unreadBadge = chat.unread > 0 ? 
        `<div class="unread-badge">${chat.unread}</div>` : '';
    
    const onlineIndicator = chat.online ? 
        '<div class="chat-online"></div>' : '';
    
    const groupIcon = chat.isGroup ? 
        '<i class="fas fa-users" style="position: absolute; bottom: -2px; right: -2px; background: var(--orange); color: white; width: 18px; height: 18px; border-radius: 50%; font-size: 10px; display: flex; align-items: center; justify-content: center; border: 2px solid var(--dark);"></i>' : '';
    
    div.innerHTML = `
        <div class="chat-avatar">
            <img src="${chat.avatar}" alt="${chat.name}">
            ${onlineIndicator}
            ${groupIcon}
        </div>
        <div class="chat-info">
            <h4>${chat.name}</h4>
            <p>${chat.lastMessage}</p>
        </div>
        <div class="chat-meta">
            <span class="chat-time">${chat.time}</span>
            ${unreadBadge}
        </div>
    `;
    
    // Ajouter l'événement de clic
    div.addEventListener('click', () => openChat(chat));
    
    return div;
}

function openChat(chat) {
    // Simuler l'ouverture d'un chat
    console.log('Ouverture du chat:', chat.name);
    
    // En production: rediriger vers l'interface de chat
    alert(`Ouverture du chat avec ${chat.name}\n(Fonctionnalité complète à implémenter)`);
}

export async function getChatMessages(chatId) {
    // Récupérer les messages d'un chat
    return [];
}

export async function sendMessage(chatId, message) {
    // Envoyer un message
    return { success: true };
}
