import React from 'react';
import { cn } from './ui/shim';

export function UCELogoImage({ className }) {
    return (
        <img
            src="/uce-logo.png"
            alt="UCE Logo"
            className={cn("object-contain", className)}
        />
    );
}
