import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { apiFetch } from '../lib/api';

const ChatContext = createContext();

export function useChat() {
    return useContext(ChatContext);
}

export function ChatProvider({ children }) {
    const { user } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [activeChat, setActiveChat] = useState(null); // { id, nombre, role }
    const [messages, setMessages] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({}); // { senderId: count }
    const [lastMessages, setLastMessages] = useState({}); // { partnerId: { at, content } }
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Polling Refs
    const pollingRef = useRef(null);
    const unreadPollingRef = useRef(null);
    const currentViewId = useRef(0);

    // 1. Fetch Contacts on Mount
    useEffect(() => {
        if (user) {
            apiFetch('/chat/contacts')
                .then(data => setContacts(data))
                .catch(err => console.error("Failed to load contacts", err));

            fetchChatStatus();
        }
    }, [user]);

    // 2. Global Polling for Status (Every 10s)
    useEffect(() => {
        if (!user) return;
        unreadPollingRef.current = setInterval(fetchChatStatus, 10000);
        return () => clearInterval(unreadPollingRef.current);
    }, [user]);

    // 3. Poll for messages in Active Chat (Every 3s)
    useEffect(() => {
        if (activeChat) {
            fetchHistory(activeChat.id);
            pollingRef.current = setInterval(() => {
                fetchHistory(activeChat.id, true);
            }, 3000);
        } else {
            setMessages([]);
        }

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [activeChat]);

    async function fetchChatStatus() {
        try {
            const data = await apiFetch('/chat/status');

            // 1. Unread Counts
            const unreadMap = {};
            data.unread.forEach(c => unreadMap[c._id] = c.count);
            setUnreadCounts(unreadMap);

            // 2. Last Messages
            const lastMsgMap = {};
            data.lastMessages.forEach(m => {
                lastMsgMap[m._id] = { at: m.lastMessageAt, content: m.lastContent };
            });
            setLastMessages(lastMsgMap);

        } catch (e) {
            console.error("Status poll failed", e);
        }
    }

    async function fetchHistory(otherId, silent = false) {
        // Capture the current view ID at the start
        const viewId = currentViewId.current;

        if (!silent) {
            setLoadingHistory(true);
        }

        console.log(`[Chat] Fetching history for ${otherId} (ViewID: ${viewId}, Silent: ${silent})`);

        try {
            const msgs = await apiFetch(`/chat/history/${otherId}?limit=100`);

            // Validation: Only apply if the view hasn't changed
            if (currentViewId.current === viewId) {
                console.log(`[Chat] Updating messages for ViewID: ${viewId}`);
                setMessages(msgs);

                // Mark as read
                if (unreadCounts[otherId] > 0) {
                    apiFetch(`/chat/read/${otherId}`, { method: 'POST' })
                        .then(() => setUnreadCounts(prev => ({ ...prev, [otherId]: 0 })))
                        .catch(e => console.error("Mark read failed", e));
                }
            } else {
                console.warn(`[Chat] Ignored stale response ViewID: ${viewId} (Current: ${currentViewId.current})`);
            }
        } catch (e) {
            console.error("[Chat] History fetch failed", e);
        } finally {
            // Turn off loading only if we are still on the same view
            if (!silent && currentViewId.current === viewId) {
                setLoadingHistory(false);
                console.log(`[Chat] Loading finished for ViewID: ${viewId}`);
            }
        }
    }

    async function sendMessage(content) {
        if (!activeChat || !content.trim()) return;
        try {
            // Optimistic UI update could happen here
            const msg = await apiFetch('/chat/send', {
                method: 'POST',
                body: {
                    receiverId: activeChat.id,
                    content
                }
            });
            setMessages(prev => [...prev, msg]);

            // Optimistic update for Sidebar sorting
            setLastMessages(prev => ({
                ...prev,
                [activeChat.id]: { at: new Date().toISOString(), content: content }
            }));
        } catch (e) {
            console.error("Send failed", e);
            throw e;
        }
    }

    function selectChat(contact) {
        // Invalidate previous view requests by incrementing ID
        currentViewId.current++;

        setMessages([]); // Clear immediately 
        if (contact) {
            setLoadingHistory(true);
        }
        setActiveChat(contact);
    }

    const value = {
        contacts,
        activeChat,
        selectChat, // Use this instead of setActiveChat
        messages,
        sendMessage,
        unreadCounts,
        lastMessages,
        loadingHistory
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}
