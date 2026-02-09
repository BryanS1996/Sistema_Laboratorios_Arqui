import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';

export default function ChatWindow() {
    const { activeChat, selectChat, messages, sendMessage, loadingHistory } = useChat();
    const { user } = useAuth();
    const [inputText, setInputText] = useState('');
    const messagesContainerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [sending, setSending] = useState(false);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            const { scrollHeight, clientHeight } = messagesContainerRef.current;
            messagesContainerRef.current.scrollTop = scrollHeight - clientHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, activeChat]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        setSending(true);
        try {
            await sendMessage(inputText);
            setInputText('');
        } finally {
            setSending(false);
        }
    };

    if (!activeChat) return null;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="h-16 px-4 border-b bg-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => selectChat(null)}
                        className="md:hidden p-1 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                        {activeChat.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{activeChat.nombre}</h3>
                        <span className="text-xs text-gray-500 capitalize flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${true ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            Disponible
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
            >
                {loadingHistory && messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full text-gray-400">
                        <Loader2 className="animate-spin mr-2" /> Cargando historial...
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isMe = String(msg.senderId) === String(user.id);
                        // Group logic could go here (check valid time diff)

                        return (
                            <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 border shadow-sm text-sm
                    ${isMe
                                            ? 'bg-blue-600 text-white border-blue-600 rounded-br-none'
                                            : 'bg-white text-gray-800 border-gray-200 rounded-bl-none'
                                        }
                  `}
                                >
                                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                    <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t shrink-0">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 rounded-full border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:ring-blue-500 transition-colors outline-none border"
                        placeholder="Escribe un mensaje..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim() || sending}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors shadow-sm"
                    >
                        {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
