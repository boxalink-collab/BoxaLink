
// modules/agora.js - Gestion de l'Agora (style Facebook)
import { appState } from './app.js';

export function initAgora() {
    console.log('Module Agora initialisé');
}

export async function loadPosts() {
    const postsList = document.getElementById('posts-list');
    if (!postsList) return;
    
    // Données de démo
    const demoPosts = [
        {
            id: 'post1',
            author: 'Université de Paris',
            authorAvatar: 'https://i.pravatar.cc/300?img=30',
            time: 'Il y a 2 heures',
            content: '📢 URGENT : Les inscriptions pour le semestre d\'automne sont ouvertes jusqu\'au 30 juin. Ne tardez pas à vous inscrire via le portail étudiant.',
            badge: 'priority',
            badgeText: 'Information Prioritaire',
            likes: 124,
            comments: 23,
            shares: 45,
            liked: false,
            image: null
        },
        {
            id: 'post2',
            author: 'TechCorp',
            authorAvatar: 'https://i.pravatar.cc/300?img=31',
            time: 'Il y a 5 heures',
            content: 'Découvrez notre nouveau logiciel d\'analyse de données spécialement conçu pour les chercheurs. Offre spéciale de lancement : 30% de réduction pour les membres de BoxaLink.',
            badge: 'sponsored',
            badgeText: 'Sponsorisé',
            likes: 89,
            comments: 12,
            shares: 18,
            liked: false,
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 'post3',
            author: 'Dr. Sophie Laurent',
            authorAvatar: 'https://i.pravatar.cc/300?img=9',
            time: 'Il y a 1 jour',
            content: 'Je partage avec vous mon dernier article sur les avancées dans la recherche sur le cancer. J\'espère que cela pourra être utile à certains d\'entre vous dans vos travaux.',
            badge: null,
            badgeText: '',
            likes: 245,
            comments: 42,
            shares: 67,
            liked: true,
            image: null
        },
        {
            id: 'post4',
            author: 'Croix-Rouge France',
            authorAvatar: 'https://i.pravatar.cc/300?img=32',
            time: 'Il y a 2 jours',
            content: 'Nous organisons une collecte de sang le 15 juin à Paris. Si vous êtes disponible et éligible, venez nombreux ! Chaque don compte.',
            badge: null,
            badgeText: '',
            likes: 156,
            comments: 28,
            shares: 41,
            liked: false,
            image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        }
    ];
    
    // Vider la liste
    postsList.innerHTML = '';
    
    // Ajouter chaque post
    demoPosts.forEach(post => {
        const postElement = createPostElement(post);
        postsList.appendChild(postElement);
    });
}

function createPostElement(post) {
    const div = document.createElement('div');
    div.className = 'post-item';
    div.dataset.postId = post.id;
    
    const badgeHtml = post.badge ? 
        `<span class="post-badge badge-${post.badge}">${post.badgeText}</span>` : '';
    
    const imageHtml = post.image ? 
        `<img src="${post.image}" alt="Publication" class="post-image">` : '';
    
    const likeIcon = post.liked ? 'fas fa-thumbs-up' : 'far fa-thumbs-up';
    const likeClass = post.liked ? 'active' : '';
    
    div.innerHTML = `
        <div class="post-header">
            <div class="post-avatar">
                <img src="${post.authorAvatar}" alt="${post.author}">
            </div>
            <div class="post-author">
                <h4>${post.author}</h4>
                <div class="post-meta">
                    <span class="post-time">${post.time}</span>
                    ${badgeHtml}
                </div>
            </div>
        </div>
        <div class="post-content">
            <p>${post.content}</p>
            ${imageHtml}
        </div>
        <div class="post-actions">
            <button class="action-btn like-btn ${likeClass}">
                <i class="${likeIcon}"></i>
                <span class="like-count">${post.likes}</span>
            </button>
            <button class="action-btn comment-btn">
                <i class="far fa-comment"></i>
                <span>${post.comments}</span>
            </button>
            <button class="action-btn share-btn">
                <i class="fas fa-share"></i>
                <span>${post.shares}</span>
            </button>
        </div>
    `;
    
    // Ajouter les événements
    const likeBtn = div.querySelector('.like-btn');
    const likeCount = div.querySelector('.like-count');
    const likeIconElem = div.querySelector('.like-btn i');
    
    likeBtn.addEventListener('click', () => {
        if (post.liked) {
            post.likes--;
            post.liked = false;
            likeIconElem.className = 'far fa-thumbs-up';
            likeBtn.classList.remove('active');
        } else {
            post.likes++;
            post.liked = true;
            likeIconElem.className = 'fas fa-thumbs-up';
            likeBtn.classList.add('active');
        }
        likeCount.textContent = post.likes;
    });
    
    return div;
}

export async function createPost(content, image = null) {
    // Créer une nouvelle publication
    return { success: true, postId: `post_${Date.now()}` };
}

export async function likePost(postId) {
    // Liker un post
    return { success: true };
}
