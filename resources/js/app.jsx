import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';

const root = document.getElementById('app');

if (root) {
    createRoot(root).render(
        <React.StrictMode>
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <h1 className="text-4xl font-bold text-gray-800">New Forms Application</h1>
            </div>
        </React.StrictMode>
    );
}
