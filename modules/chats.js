import { collection, query, where, onSnapshot, addDoc, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

export function initChats(db, auth, userData) {
    const view = document.getElementById('app-view');
    
    // Structure HTML du module Chats
    view.innerHTML = `
        <div id="chats-wrapper">
            <div id="chats-list-screen">
                <div class="search-bar-chat">
                    <input type="text" placeholder="Rechercher une discussion...">
                </div>
                <div id="conversations-container">
                    <div class="loading-status">Chargement de vos messages...</div>
                </div>
                <button class="fab" id="start-new-chat"><i class="fas fa-plus"></i></button>
            </div>

            <div id="chat-detail-screen" class="hidden">
                <div class="chat-header">
                    <button id="close-chat"><i class="fas fa-arrow-left"></i></button>
                    <div class="chat-contact-profile">
                        <div class="avatar-circle" id="target-avatar">?</div>
                        <div class="chat-contact-text">
                            <span id="target-name">Nom</span>
                            <small id="target-status">En ligne</small>
                        </div>
                    </div>
                </div>
                <div id="messages-log"></div>
                <div class="chat-input-bar">
                    <button class="icon-btn"><i class="far fa-smile"></i></button>
                    <input type="text" id="input-msg" placeholder="Message">
                    <button id="send-btn"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    `;

    const convContainer = document.getElementById('conversations-container');
    const detailScreen = document.getElementById('chat-detail-screen');
    const messagesLog = document.getElementById('messages-log');

    // --- 1. CHARGEMENT DES DISCUSSIONS (STYLE WHATSAPP) ---
    const q = query(
        collection(db, "conversations"),
        where("participants", "array-contains", userData.uid)
    );

    onSnapshot(q, (snapshot) => {
        convContainer.innerHTML = "";
        if (snapshot.empty) {
            convContainer.innerHTML = `<div class="empty-msg">Aucune discussion. Cliquez sur + pour commencer.</div>`;
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const otherName = data.participantNames.find(n => n !== userData.name);
            
            const item = document.createElement('div');
            item.className = 'conversation-item';
            item.innerHTML = `
                <div class="avatar-circle">${otherName.charAt(0)}</div>
                <div class="conv-details">
                    <div class="conv-row"><strong>${otherName}</strong><small>12:00</small></div>
                    <p>${data.lastMessage || "Nouveau message..."}</p>
                </div>
            `;
            item.onclick = () => openConversation(doc.id, otherName);
            convContainer.appendChild(item);
        });
    });

    // --- 2. OUVERTURE D'UN CHAT ---
    function openConversation(convId, name) {
        detailScreen.classList.remove('hidden');
        document.getElementById('target-name').innerText = name;
        document.getElementById('target-avatar').innerText = name.charAt(0);

        // Ecouter les messages de cette conv
        const qMsg = query(
            collection(db, "conversations", convId, "messages"),
            orderBy("timestamp", "asc")
        );

        onSnapshot(qMsg, (snap) => {
            messagesLog.innerHTML = "";
            snap.forEach(mDoc => {
                const msg = mDoc.data();
                const mine = msg.senderId === userData.uid;
                messagesLog.innerHTML += `
                    <div class="bubble-wrap ${mine ? 'me' : 'them'}">
                        <div class="bubble">${msg.text}</div>
                    </div>
                `;
            });
            messagesLog.scrollTop = messagesLog.scrollHeight;
        });

        // Envoi de message
        document.getElementById('send-btn').onclick = async () => {
            const txt = document.getElementById('input-msg').value;
            if(!txt.trim()) return;

            await addDoc(collection(db, "conversations", convId, "messages"), {
                text: txt,
                senderId: userData.uid,
                timestamp: serverTimestamp()
            });
            document.getElementById('input-msg').value = "";
        };
    }

    document.getElementById('close-chat').onclick = () => detailScreen.classList.add('hidden');

    // --- 3. NOUVEAU CHAT (RÉPERTOIRE) ---
    document.getElementById('start-new-chat').onclick = async () => {
        try {
            // Tentative d'accès au répertoire natif (Android/Chrome)
            const contacts = await navigator.contacts.select(['name', 'tel'], {multiple: false});
            if (contacts.length) {
                alert("Invitation envoyée à " + contacts[0].name);
            }
        } catch (e) {
            const num = prompt("Entrez le numéro ou l'email du contact :");
            if(num) window.location.href = `sms:${num}?body=Rejoins-moi sur BoxaLink !`;
        }
    };
}
