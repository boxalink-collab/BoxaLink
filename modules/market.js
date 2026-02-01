// modules/market.js - Gestion du marché
import { appState } from './app.js';

export function initMarket() {
    console.log('Module Market initialisé');
    initMarketFilters();
}

export async function loadProducts(filter = 'all') {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    // Données de démo
    const demoProducts = [
        {
            id: 'prod1',
            name: 'Laptop Dell XPS 13',
            price: 1200,
            originalPrice: 1400,
            location: 'Paris 15e',
            seller: 'Pierre Martin',
            sellerAvatar: 'https://i.pravatar.cc/300?img=3',
            image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            discount: true,
            nearby: true
        },
        {
            id: 'prod2',
            name: 'Livres de médecine (lot)',
            price: 80,
            originalPrice: 120,
            location: 'Lyon',
            seller: 'Étudiante en médecine',
            sellerAvatar: 'https://i.pravatar.cc/300?img=10',
            image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            discount: true,
            nearby: false
        },
        {
            id: 'prod3',
            name: 'Bureau ergonomique',
            price: 150,
            originalPrice: 150,
            location: 'Marseille',
            seller: 'Jean Dupont',
            sellerAvatar: 'https://i.pravatar.cc/300?img=7',
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            discount: false,
            nearby: false
        },
        {
            id: 'prod4',
            name: 'Microscope professionnel',
            price: 450,
            originalPrice: 600,
            location: 'Toulouse',
            seller: 'Laboratoire Univ.',
            sellerAvatar: 'https://i.pravatar.cc/300?img=15',
            image: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            discount: true,
            nearby: false
        },
        {
            id: 'prod5',
            name: 'Smartphone Samsung S23',
            price: 800,
            originalPrice: 1000,
            location: 'Paris 8e',
            seller: 'TechShop',
            sellerAvatar: 'https://i.pravatar.cc/300?img=18',
            image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            discount: true,
            nearby: true
        },
        {
            id: 'prod6',
            name: 'Caméra Canon EOS R5',
            price: 3500,
            originalPrice: 3500,
            location: 'Nice',
            seller: 'Photographe Pro',
            sellerAvatar: 'https://i.pravatar.cc/300?img=22',
            image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            discount: false,
            nearby: false
        }
    ];
    
    // Filtrer les produits
    let filteredProducts = demoProducts;
    
    if (filter === 'nearby') {
        filteredProducts = demoProducts.filter(p => p.nearby);
    } else if (filter === 'discount') {
        filteredProducts = demoProducts.filter(p => p.discount);
    }
    
    // Vider la grille
    productsGrid.innerHTML = '';
    
    // Ajouter chaque produit
    filteredProducts.forEach(product => {
        const productElement = createProductElement(product);
        productsGrid.appendChild(productElement);
    });
}

function createProductElement(product) {
    const div = document.createElement('div');
    div.className = 'product-item';
    div.dataset.productId = product.id;
    
    const discountBadge = product.discount ? 
        `<div style="position: absolute; top: 10px; right: 10px; background: #FF4757; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">
            -${Math.round((1 - product.price/product.originalPrice) * 100)}%
        </div>` : '';
    
    const originalPrice = product.discount ? 
        `<span style="font-size: 14px; color: var(--text-light); text-decoration: line-through; margin-right: 8px;">
            ${product.originalPrice}€
        </span>` : '';
    
    div.innerHTML = `
        <div style="position: relative;">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            ${discountBadge}
        </div>
        <div class="product-details">
            <h4>${product.name}</h4>
            <div class="product-price">
                ${originalPrice}
                ${product.price}€
            </div>
            <div class="product-location">
                <i class="fas fa-map-marker-alt"></i> ${product.location}
            </div>
            <div class="product-seller">
                <img src="${product.sellerAvatar}" alt="${product.seller}">
                <span>${product.seller}</span>
            </div>
            <button class="contact-btn" data-product-id="${product.id}">
                Contacter le vendeur
            </button>
        </div>
    `;
    
    // Ajouter l'événement de contact
    const contactBtn = div.querySelector('.contact-btn');
    contactBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        contactSeller(product);
    });
    
    // Ajouter l'événement pour voir les détails
    div.addEventListener('click', () => viewProductDetails(product));
    
    return div;
}

function initMarketFilters() {
    const filterButtons = document.querySelectorAll('#market-section .filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Mettre à jour les boutons actifs
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Charger les produits filtrés
            const filter = btn.dataset.filter;
            loadProducts(filter);
        });
    });
}

function contactSeller(product) {
    console.log('Contact du vendeur:', product.seller);
    
    // Simuler l'ouverture d'un chat
    showToast(`Ouverture du chat avec ${product.seller}`, 'info');
    
    // En production: ouvrir l'interface de chat
    setTimeout(() => {
        alert(`Chat ouvert avec ${product.seller} pour "${product.name}"\n\nPrix: ${product.price}€\nLocalisation: ${product.location}`);
    }, 500);
}

function viewProductDetails(product) {
    console.log('Voir détails:', product.name);
    
    // Afficher les détails
    const details = `
        Produit: ${product.name}
        Prix: ${product.price}€ ${product.discount ? `(Promotion: ${product.originalPrice}€)` : ''}
        Vendeur: ${product.seller}
        Localisation: ${product.location}
        ${product.discount ? `Économisez ${product.originalPrice - product.price}€ !` : ''}
    `;
    
    alert(details);
}

function showToast(message, type) {
    // Implémentation simple
    console.log(`${type}: ${message}`);
}
