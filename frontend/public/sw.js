// Service worker minimal, sengaja tidak melakukan caching apa pun.
// Fungsinya hanya supaya browser menganggap situs ini "installable"
// (syarat Chrome: manifest valid + service worker terdaftar).
// Semua request tetap diteruskan langsung ke jaringan seperti biasa,
// jadi tidak ada risiko versi lama ter-cache setelah deploy baru.

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request))
})
