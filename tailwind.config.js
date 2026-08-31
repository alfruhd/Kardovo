import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'Segoe UI', ...defaultTheme.fontFamily.sans],
                display: ['Inter', 'Poppins', 'sans-serif'],
            },
            colors: {
                kardovo: {
                    navy: '#111E2E',
                    'blue-dark': '#1144A0',
                    'blue-light': '#008EE8',
                    green: '#117534',
                    'green-dark': '#005023',
                    'muted-grey': '#6F7A85',
                    'bg-slate': '#F4F6F9',
                },
                brand: {
                    navy: '#111E2E',
                    blue: '#1144A0',
                    cyan: '#008EE8',
                    green: '#117534',
                    forest: '#005023',
                    grey: '#6F7A85',
                },
            },
            borderRadius: {
                'card': '16px',
            },
            boxShadow: {
                'card': '0 4px 20px -2px rgba(17, 30, 46, 0.06), 0 2px 6px -1px rgba(17, 30, 46, 0.04)',
                'card-hover': '0 10px 25px -3px rgba(17, 30, 46, 0.1), 0 4px 10px -2px rgba(17, 30, 46, 0.05)',
            },
        },
    },

    plugins: [forms],
};
