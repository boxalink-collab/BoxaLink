// modules/library.js - Gestion de la bibliothèque de documents
import { appState } from '/app.js';

export function initLibrary() {
    console.log('Module Bibliothèque initialisé');
    initFilters();
}

export async function loadDocuments(filter = 'all') {
    const documentsList = document.getElementById('documents-list');
    if (!documentsList) return;
    
    // Données de démo
    const demoDocuments = [
        {
            id: 'doc1',
            title: 'Introduction à l\'Intelligence Artificielle',
            author: 'Dr. Jean Petit',
            category: 'academic',
            pages: 45,
            downloads: 1200,
            icon: 'fas fa-robot',
            description: 'Cours complet sur les bases de l\'IA'
        },
        {
            id: 'doc2',
            title: 'Guide de rédaction académique',
            author: 'Prof. Marie Laurent',
            category: 'academic',
            pages: 32,
            downloads: 850,
            icon: 'fas fa-graduation-cap',
            description: 'Standards et bonnes pratiques'
        },
        {
            id: 'doc3',
            title: 'Rapport annuel sur les énergies renouvelables',
            author: 'Institut Énergétique',
            category: 'research',
            pages: 68,
            downloads: 560,
            icon: 'fas fa-solar-panel',
            description: 'Analyse complète 2024'
        },
        {
            id: 'doc4',
            title: 'Modèle de contrat freelance',
            author: 'Cabinet LegalPro',
            category: 'professional',
            pages: 12,
            downloads: 2100,
            icon: 'fas fa-file-contract',
            description: 'Template juridique'
        },
        {
            id: 'doc5',
            title: 'Méthodologie de recherche qualitative',
            author: 'Dr. Sophie Martin',
            category: 'research',
            pages: 54,
            downloads: 720,
            icon: 'fas fa-search',
            description: 'Méthodes et outils'
        },
        {
            id: 'doc6',
            title: 'Gestion de projet Agile',
            author: 'TechLead Academy',
            category: 'professional',
            pages: 38,
            downloads: 1500,
            icon: 'fas fa-tasks',
            description: 'Scrum et Kanban'
        }
    ];
    
    // Filtrer les documents
    const filteredDocs = filter === 'all' 
        ? demoDocuments 
        : demoDocuments.filter(doc => doc.category === filter);
    
    // Vider la liste
    documentsList.innerHTML = '';
    
    // Ajouter chaque document
    filteredDocs.forEach(doc => {
        const docElement = createDocumentElement(doc);
        documentsList.appendChild(docElement);
    });
}

function createDocumentElement(doc) {
    const div = document.createElement('div');
    div.className = 'document-item';
    div.dataset.docId = doc.id;
    
    div.innerHTML = `
        <div class="document-icon">
            <i class="${doc.icon}"></i>
        </div>
        <div class="document-info">
            <h4>${doc.title}</h4>
            <p>Par ${doc.author}</p>
            <p style="font-size: 13px; color: var(--text-light); margin-bottom: 8px;">${doc.description}</p>
            <div class="document-meta">
                <span><i class="fas fa-tag"></i> ${getCategoryName(doc.category)}</span>
                <span><i class="fas fa-file"></i> ${doc.pages} pages</span>
                <span><i class="fas fa-download"></i> ${doc.downloads.toLocaleString()}</span>
            </div>
        </div>
        <button class="download-btn" data-doc-id="${doc.id}">
            <i class="fas fa-download"></i>
        </button>
    `;
    
    // Ajouter l'événement de téléchargement
    const downloadBtn = div.querySelector('.download-btn');
    downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        downloadDocument(doc);
    });
    
    return div;
}

function getCategoryName(category) {
    const categories = {
        'academic': 'Académique',
        'professional': 'Professionnel',
        'research': 'Recherche'
    };
    return categories[category] || category;
}

function downloadDocument(doc) {
    console.log('Téléchargement:', doc.title);
    
    // Simuler un téléchargement
    showToast(`Téléchargement de "${doc.title}" en cours...`, 'info');
    
    setTimeout(() => {
        showToast(`"${doc.title}" téléchargé avec succès!`, 'success');
        doc.downloads++;
        
        // Mettre à jour l'affichage
        const docElement = document.querySelector(`[data-doc-id="${doc.id}"] .document-meta span:nth-child(3)`);
        if (docElement) {
            docElement.innerHTML = `<i class="fas fa-download"></i> ${doc.downloads.toLocaleString()}`;
        }
    }, 1000);
}

function initFilters() {
    const filterButtons = document.querySelectorAll('#library-section .filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Mettre à jour les boutons actifs
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Charger les documents filtrés
            const filter = btn.dataset.filter;
            loadDocuments(filter);
        });
    });
}

function showToast(message, type) {
    alert(`${type.toUpperCase()}: ${message}`);
}
