/**
 * CLUES™ Quantum Property Intelligence System
 * Service Worker - Offline Support & Caching
 *
 * @version 1.0.0
 */

const CACHE_NAME = 'clues-quantum-v1.0.1';
const OFFLINE_URL = '/offline.html';

// Files to cache immediately
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/offline.html',
    '/src/core/data-manager.js',
    '/src/core/scoring-engine.js',
    '/src/core/import-export.js',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// Install event - cache core assets
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Pre-caching core assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Pre-cache complete');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('[Service Worker] Pre-cache failed:', error.message);
                // Continue anyway - app will work without cache
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => cacheName !== CACHE_NAME)
                        .map(cacheName => {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Return cached version if available
                if (cachedResponse) {
                    console.log('[Service Worker] Serving from cache:', event.request.url);
                    return cachedResponse;
                }

                // Otherwise fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Don't cache if not a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone response (can only be consumed once)
                        const responseToCache = response.clone();

                        // Cache the fetched resource
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Network fetch failed, show offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL);
                        }
                    });
            })
    );
});

// Background sync for offline data
self.addEventListener('sync', event => {
    console.log('[Service Worker] Background sync:', event.tag);

    if (event.tag === 'sync-properties') {
        event.waitUntil(syncProperties());
    }
});

async function syncProperties() {
    // Sync logic when online
    console.log('[Service Worker] Syncing properties...');
    // This would sync with backend API when available
}

// Push notifications
self.addEventListener('push', event => {
    console.log('[Service Worker] Push notification received');

    const options = {
        body: event.data ? event.data.text() : 'New property alert!',
        icon: '/src/assets/icons/icon-192x192.png',
        badge: '/src/assets/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Property',
                icon: '/src/assets/icons/action-view.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/src/assets/icons/action-close.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('CLUES™ Quantum', options)
    );
});

// Notification click
self.addEventListener('notificationclick', event => {
    console.log('[Service Worker] Notification clicked:', event.action);

    event.notification.close();

    event.waitUntil(
        clients.openWindow('/')
    );
});

console.log('[Service Worker] Script loaded');
