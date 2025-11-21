#!/usr/bin/env node
/**
 * 🏗️ BUILD SYSTEM - Compiles src/ → www/ for Capacitor
 *
 * This script prepares the web app for mobile deployment:
 * 1. Copies all src/ files to www/
 * 2. Copies public/ assets to www/
 * 3. Creates index.html entry point
 * 4. Generates Capacitor config files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, 'src');
const PUBLIC_DIR = path.join(__dirname, 'public');
const WWW_DIR = path.join(__dirname, 'www');

console.log('🏗️ BUILDING WEB APP FOR CAPACITOR\n');

/**
 * Recursively copy directory
 */
function copyDir(src, dest) {
    // Create destination directory
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    // Read source directory
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            // Skip node_modules and scrapers (backend only)
            if (entry.name === 'node_modules' || entry.name === 'scrapers') {
                console.log(`   ⏭️  Skipping: ${entry.name}/`);
                continue;
            }
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

/**
 * Create index.html entry point
 */
function createIndexHtml() {
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="description" content="CLUES™ Quantum Property Intelligence System">
    <meta name="theme-color" content="#0066CC">

    <title>CLUES™ Property Intelligence</title>

    <!-- Capacitor -->
    <script type="module" src="capacitor.js"></script>

    <!-- App Styles -->
    <link rel="stylesheet" href="styles/main.css">
    <link rel="manifest" href="manifest.json">

    <!-- App Icons -->
    <link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192x192.png">
    <link rel="apple-touch-icon" sizes="180x180" href="icons/apple-touch-icon.png">
</head>
<body>
    <div id="app-root">
        <!-- Main app container -->
        <div id="splash-screen" class="splash-screen">
            <img src="icons/icon-512x512.png" alt="CLUES™" class="splash-logo">
            <h1>CLUES™</h1>
            <p>Quantum Property Intelligence</p>
            <div class="loading-spinner"></div>
        </div>

        <!-- App modules will load here -->
        <div id="app-content" style="display:none;">
            <h1>🌐 CLUES™ Quantum Intelligence</h1>
            <p>Loading modules...</p>

            <!-- Quick Links -->
            <nav class="app-nav">
                <a href="enhancement_3_holographic_sphere.html" class="nav-btn">
                    🌐 Holographic Property Command Center
                </a>
                <a href="enhancement_5_weather_simulator.html" class="nav-btn">
                    🌦️ Weather Impact Simulator
                </a>
                <!-- Add more enhancement links as needed -->
            </nav>
        </div>
    </div>

    <!-- App Scripts -->
    <script type="module" src="core/data-manager.js"></script>
    <script type="module" src="app.js"></script>

    <style>
        body {
            margin: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0066CC 0%, #004d99 100%);
            color: white;
        }

        .splash-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
        }

        .splash-logo {
            width: 128px;
            height: 128px;
            animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
        }

        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255,255,255,0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-top: 20px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .app-nav {
            display: flex;
            flex-direction: column;
            gap: 15px;
            max-width: 600px;
            margin: 40px auto;
            padding: 20px;
        }

        .nav-btn {
            background: rgba(255,255,255,0.1);
            border: 2px solid rgba(255,255,255,0.3);
            padding: 20px;
            border-radius: 12px;
            text-decoration: none;
            color: white;
            font-size: 18px;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }

        .nav-btn:hover {
            background: rgba(255,255,255,0.2);
            border-color: rgba(255,255,255,0.5);
            transform: translateY(-2px);
        }
    </style>

    <script>
        // Hide splash screen after load
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.getElementById('splash-screen').style.display = 'none';
                document.getElementById('app-content').style.display = 'block';
            }, 2000);
        });
    </script>
</body>
</html>`;

    fs.writeFileSync(path.join(WWW_DIR, 'index.html'), indexHtml);
    console.log('✅ Created index.html');
}

/**
 * Create app.js entry point
 */
function createAppJs() {
    const appJs = `/**
 * CLUES™ Quantum App - Main Entry Point
 */

// Initialize Capacitor plugins
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

// App lifecycle
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 CLUES™ Quantum App Initialized');

    // Configure status bar
    try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0066CC' });
    } catch (e) {
        console.log('Status bar not available (web mode)');
    }

    // Hide splash screen after app loads
    try {
        await SplashScreen.hide();
    } catch (e) {
        console.log('Splash screen not available (web mode)');
    }
});

// Handle back button on Android
App.addListener('backButton', ({ canGoBack }) => {
    if (!canGoBack) {
        App.exitApp();
    } else {
        window.history.back();
    }
});

// API client for backend
export class CLUESApi {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl || (window.location.hostname === 'localhost'
            ? 'http://localhost:3000'
            : 'https://quantumintelligence.vercel.app');
    }

    async scrapeProperty(url, llm = 'auto') {
        const response = await fetch(\`\${this.baseUrl}/api/scrape-property\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, llm })
        });

        if (!response.ok) {
            throw new Error(\`Scraping failed: \${response.statusText}\`);
        }

        return await response.json();
    }

    async searchProperties(location, limit = 3, filters = {}) {
        const response = await fetch(\`\${this.baseUrl}/api/search-properties\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ location, limit, filters })
        });

        if (!response.ok) {
            throw new Error(\`Search failed: \${response.statusText}\`);
        }

        return await response.json();
    }

    async comparePrices(properties, area) {
        const response = await fetch(\`\${this.baseUrl}/api/compare-prices\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ properties, area })
        });

        if (!response.ok) {
            throw new Error(\`Comparison failed: \${response.statusText}\`);
        }

        return await response.json();
    }
}

// Make API globally available
window.CLUESApi = new CLUESApi();
`;

    fs.writeFileSync(path.join(WWW_DIR, 'app.js'), appJs);
    console.log('✅ Created app.js');
}

/**
 * Main build process
 */
async function build() {
    try {
        // Step 1: Clean www directory
        console.log('1️⃣ Cleaning www/ directory...');
        if (fs.existsSync(WWW_DIR)) {
            fs.rmSync(WWW_DIR, { recursive: true, force: true });
        }
        fs.mkdirSync(WWW_DIR, { recursive: true });
        console.log('✅ Cleaned www/\n');

        // Step 2: Copy src/ to www/
        console.log('2️⃣ Copying src/ to www/...');
        copyDir(SRC_DIR, WWW_DIR);
        console.log('✅ Copied src/ to www/\n');

        // Step 3: Copy public/ assets
        if (fs.existsSync(PUBLIC_DIR)) {
            console.log('3️⃣ Copying public/ assets...');
            const publicEntries = fs.readdirSync(PUBLIC_DIR, { withFileTypes: true });
            for (const entry of publicEntries) {
                const srcPath = path.join(PUBLIC_DIR, entry.name);
                const destPath = path.join(WWW_DIR, entry.name);
                if (entry.isDirectory()) {
                    copyDir(srcPath, destPath);
                } else {
                    fs.copyFileSync(srcPath, destPath);
                }
            }
            console.log('✅ Copied public/ assets\n');
        }

        // Step 4: Create index.html
        console.log('4️⃣ Creating index.html...');
        createIndexHtml();
        console.log('');

        // Step 5: Create app.js
        console.log('5️⃣ Creating app.js...');
        createAppJs();
        console.log('');

        // Step 6: Copy capacitor config
        console.log('6️⃣ Copying Capacitor config...');
        if (fs.existsSync(path.join(__dirname, 'capacitor.config.json'))) {
            fs.copyFileSync(
                path.join(__dirname, 'capacitor.config.json'),
                path.join(WWW_DIR, 'capacitor.config.json')
            );
            console.log('✅ Copied capacitor.config.json\n');
        }

        console.log('✅ BUILD COMPLETE!\n');
        console.log('📁 Output directory: www/');
        console.log('🚀 Ready for Capacitor: npx cap sync');
        console.log('📱 Open Android: npx cap open android');
        console.log('🍎 Open iOS: npx cap open ios\n');

    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

// Run build
build();
