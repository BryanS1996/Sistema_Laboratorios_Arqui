import React from 'react';
import AppLayout from '../../components/AppLayout';
import ChatLayout from './ChatLayout';
import { ChatProvider } from '../../contexts/ChatContext';

export default function ChatPage() {
    // Wrap with Provider here so Context is available to children
    return (
        <ChatProvider>
            <AppLayout>
                <div className="h-full">
                    {/* h-full needed because ChatLayout sets explicit height */}
                    <ChatLayout />
                </div>
            </AppLayout>
        </ChatProvider>
    );
}
