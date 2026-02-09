import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { Search, UserCircle2, GraduationCap, Users } from 'lucide-react';

export default function ChatSidebar() {
    const { contacts, activeChat, selectChat, unreadCounts, lastMessages } = useChat();
    const [search, setSearch] = useState('');

    // Filter contacts
    const filtered = contacts.filter(c =>
        c.nombre.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    // Sort Order:
    // 1. Unread Messages (High Priority)
    // 2. Last Message Date (Newest First)
    // 3. Alphabetical (Fallback)
    filtered.sort((a, b) => {
        const unreadA = (unreadCounts[a.id] || 0) > 0 ? 1 : 0;
        const unreadB = (unreadCounts[b.id] || 0) > 0 ? 1 : 0;

        if (unreadA !== unreadB) return unreadB - unreadA; // Unread first

        const timeA = lastMessages[a.id]?.at ? new Date(lastMessages[a.id].at).getTime() : 0;
        const timeB = lastMessages[b.id]?.at ? new Date(lastMessages[b.id].at).getTime() : 0;

        return timeB - timeA; // Newest date first
    });

    // Grouping Logic (Simplified for MVP)
    const grouped = {
        'Profesores': filtered.filter(c => c.role === 'professor'),
        'Estudiantes': filtered.filter(c => c.role === 'student'),
        'Administración': filtered.filter(c => c.role === 'admin'),
    };

    const getIcon = (role) => {
        switch (role) {
            case 'admin': return <GraduationCap size={16} className="text-purple-600" />;
            case 'professor': return <Users size={16} className="text-blue-600" />;
            default: return <UserCircle2 size={16} className="text-gray-600" />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header / Search */}
            <div className="p-4 border-b">
                <h2 className="text-lg font-bold text-gray-800 mb-3">Mensajes</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar contacto..."
                        className="w-full pl-9 pr-3 py-2 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg text-sm transition-all"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-4">
                {Object.entries(grouped).map(([category, items]) => (
                    items.length > 0 && (
                        <div key={category}>
                            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">{category}</h3>
                            <div className="space-y-1">
                                {items.map(contact => {
                                    const unread = unreadCounts[contact.id] || 0;
                                    const isActive = activeChat?.id === contact.id;

                                    return (
                                        <button
                                            key={contact.id}
                                            onClick={() => selectChat(contact)}
                                            className={`w-full text-left flex items-center justify-between p-3 rounded-lg transition-colors
                        ${isActive ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50 border-transparent'}
                      `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold shrink-0">
                                                    {contact.nombre.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="truncate">
                                                    <p className={`text-sm font-medium truncate w-32 ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                                                        {contact.nombre}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                        {getIcon(contact.role)}
                                                        <span className="capitalize">{contact.role}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {unread > 0 && (
                                                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                                    {unread}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )
                ))}

                {filtered.length === 0 && (
                    <div className="text-center text-gray-400 text-sm py-8">
                        No se encontraron contactos.
                    </div>
                )}
            </div>
        </div>
    );
}
