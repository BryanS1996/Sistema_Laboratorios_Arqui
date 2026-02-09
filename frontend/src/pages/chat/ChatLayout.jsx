import React, { useState } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import { useChat } from '../../contexts/ChatContext';
import { MessageSquareOff } from 'lucide-react';

export default function ChatLayout() {
    const { activeChat } = useChat();
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(true);

    // On mobile: if activeChat is selected, hide sidebar.
    // We can toggle this state based on interactions.

    return (
        <div className="flex h-full border rounded-xl overflow-hidden bg-white shadow-sm">
            {/* Sidebar - Contacts */}
            <div className={`${activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r`}>
                <ChatSidebar />
            </div>

            {/* Chat Area */}
            <div className={`${!activeChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-gray-50`}>
                {activeChat ? (
                    <ChatWindow />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                            <MessageSquareOff size={48} />
                        </div>
                        <p className="text-lg font-medium">Selecciona un contacto</p>
                        <p className="text-sm">Para comenzar a chatear</p>
                    </div>
                )}
            </div>
        </div>
    );
}
