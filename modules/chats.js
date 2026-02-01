import { collection, query, where, onSnapshot, addDoc, orderBy, serverTimestamp, or } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

export function initChats(db, auth, userData) {
    const view = document.getElementById('app-view');
    
    // 1. Structure de base (Liste des discussions)
    view.innerHTML = `
        <div id="chats-container">
            <div id="chats-list">
                <div class="loading-spinner">Chargement des discussions...</div>
            </div>
            <button class="fab" id="new-chat-btn"><i class="fas fa-comment-medical"></i></button>
        </div>
        <div id="chat-window" class="chat-window hidden">
            <div class="chat-header">
                <button id="back-to-list"><i class="fas fa-arrow-left"></i></button>
                <div class="contact-info">
                    <div class="avatar-s" id="active-chat-avatar"></div>
                    <span id="active-chat-name">Nom du contact</span>
                </div>
            </div>
            <div id="messages-display"></div>
            <div class="message-input-area">
                <button class="input-action"><i class="far fa-smile"></i></button>
                <input type="text" id="msg-input" placeholder="Message">
                <button id="send-msg-btn"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    `;

    const chatsList = document.getElementById('chats-list');
    const chatWindow = document.getElementById('chat-window');
    const messagesDisplay = document.getElementById('messages-display');

    // 2. Écouter les discussions existantes (Temps réel)
    const qChats = query(
        collection(db, "conversations"),
        where("participants", "array-contains", userData.uid)
    );

    onSnapshot(qChats, (snapshot) => {
        chatsList.innerHTML = "";
        if (snapshot.empty) {
            chatsList.innerHTML = `<div class="empty-state">Appuyez sur + pour démarrer une discussion</div>`;
        }
        snapshot.forEach(doc => {
            const chat = doc.data();
            const otherParticipant = chat.participantNames.find(n => n !== userData.name);
            
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            chatItem.innerHTML = `
                <div class="avatar-m">${otherParticipant.charAt(0)}</div>
                <div class="chat-info">
                    <div class="chat-top">
                        <span class="chat-name">${otherParticipant}</span>
                        <span class="chat-time">12:45</span>
                    </div>
                    <p class="chat-last-msg">${chat.lastMessage || "Nouveau message..."}</p>
                </div>
            `;
            chatItem.onclick = () => openChat(doc.id, otherParticipant);
            chatsList.appendChild(chatItem);
        });
    });

    // 3. Ouvrir une conversation
    function openChat(chatId, contactName) {
        chatWindow.classList.remove('hidden');
        document.getElementById('active-chat-name').innerText = contactName;
        document.getElementById('active-chat-avatar').innerText = contactName.charAt(0);
        
        // Charger les messages
        const qMsgs = query(
            collection(db, "conversations", chatId, "messages"),
            orderBy("timestamp", "asc")
        );

        onSnapshot(qMsgs, (snap) => {
            messagesDisplay.innerHTML = "";
            snap.forEach(mDoc => {
                const m = mDoc.data();
                const isMine = m.senderId === userData.uid;
                messagesDisplay.innerHTML += `
                    <div class="message-bubble ${isMine ? 'sent' : 'received'}">
                        ${m.text}
                        <span class="msg-time">${m.timestamp ? new Date(m.timestamp.seconds*1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                    </div>
                `;
            });
            messagesDisplay.scrollTop = messagesDisplay.scrollHeight;
        });

        // Envoyer un message
        document.getElementById('send-msg-btn').onclick = async () => {
            const text = document.getElementById('msg-input').value;
            if(!text.trim()) return;
            
            await addDoc(collection(db, "conversations", chatId, "messages"), {
                text: text,
                senderId: userData.uid,
                timestamp: serverTimestamp()
            });
            document.getElementById('msg-input').value = "";
        };
    }

    // Retour à la liste
    document.getElementById('back-to-list').onclick = () => chatWindow.classList.add('hidden');

    // Nouveau Chat (Accès répertoire)
    document.getElementById('new-chat-btn').onclick = async () => {
        try {
            const contacts = await navigator.contacts.select(['name', 'tel'], {multiple: false});
            if (contacts.length) {
                alert("Recherche de " + contacts[0].name + " sur BoxaLink...");
                // Ici on lancerait une recherche Firestore par numéro
            }
        } catch {
            const tel = prompt("Entrez le numéro du contact :");
            if(tel) window.location.href = `sms:${tel}?body=Rejoins-moi sur BoxaLink !`;
        }
    };
}
