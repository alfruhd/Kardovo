import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${appName} - ${title}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// 🔒 Browser Back/Forward Cache & Session Invalidation Guard
if (typeof window !== 'undefined') {
    window.addEventListener('pageshow', (event) => {
        // If the browser restored page from Back/Forward Cache, force server reload
        if (event.persisted) {
            window.location.reload();
        }
    });

    window.addEventListener('popstate', () => {
        const path = window.location.pathname;
        if (path === '/login' || path === '/verify-otp' || path === '/register') {
            window.location.reload();
        }
    });
}
