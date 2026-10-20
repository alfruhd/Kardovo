<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="scroll-smooth bg-white dark:bg-[#0B2545] overscroll-none">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
        <meta name="theme-color" content="#ffffff">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Favicon -->
        <link rel="icon" type="image/png" href="/images/kardovo_logo.png">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Dancing+Script:wght@700&family=Great+Vibes&family=Playfair+Display:ital,wght@0,700;1,400&family=Cinzel:wght@700&family=Montserrat:wght@400;600;700;800;900&display=swap" rel="stylesheet">

        <!-- Inline Theme Bootstrap: Default to Kardovo clean light theme unless explicitly chosen -->
        <script>
            try {
                const storedTheme = localStorage.getItem('kardovo_theme');
                if (storedTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            } catch (e) {}
        </script>

        <!-- Preload Hero Art for Instant Seamless Render -->
        <link rel="preload" as="image" href="/images/hero-art.jpg">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-white dark:bg-[#0B2545] text-slate-800 dark:text-slate-100 overscroll-none min-h-screen min-h-[100dvh]">
        @inertia
    </body>
</html>
