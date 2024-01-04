/*
 *  Musical Playground Progressive Web Application Service Worker
 *  Dave White, 8/27/2023
 *
 *  Performs appropriate caching of code, in order to ensure offline usability and automatic updates,
 *  for Musical Playground!
 *  
 *  The big question is whether to cache the sound font files, and which formats?  Different devices may best use different ones
 */
'use strict';

// CODELAB: Update cache names any time any of the cached files change.
// DW 10/16/2020: Changing this causes all ServiceWorker caches to refresh, and ALSO is linked to
// the automatic Field Portal Web Version software update code in the client and the server.  So just
// change this build number and everything will auto-update!
const CACHE_NAME = '01-03-2024 Build 57';

// CODELAB: Add list of files to cache here.
const FILES_TO_CACHE = [
    /*
     *  ALL FILES USED IN THE OFFLINE PWA MUST BE LISTED HERE.
     */
     "drawbars.css",
     "musicplay.html",
     "pianokeys.css",
     "pianokeys.js",
     "service-worker.js",
     "tinysynth.js" 
     ];
// we don't manually list the soundfont files, Javascript can figure it out for us!
for (var i = 1; i <= 129; i++) {
    FILES_TO_CACHE.push("bsoundfonts/SF_" + i + ".BIN");
    FILES_TO_CACHE.push("bsoundfonts/SFOGG_" + i + ".BIN");
}

self.addEventListener('install', (evt) => {
    // CODELAB: Precache static resources here.
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
    // CODELAB: Remove previous cached data from disk.
    // DW NOTE: so this is how we can improve our auto-updating feature.
    evt.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
    //console.log('[ServiceWorker] Fetch', evt.request.url);
    evt.respondWith(
        //
        //  All files are served from the cache first-- the program is intended to work
        //  entirely offline.  But an item might not be in the cache if it is a XHR
        //  request for data for example, so if it's not in the cache we look on the network.
        //
                caches.open(CACHE_NAME)
                    .then((cache) => {
                        return cache.match(evt.request).then(function (response) {
                            return response || fetch(evt.request, { credentials: 'include' }).then(function (response) {
                                // here we can handle responses from the network
                                // for example, we wouldn't want to cache them since they're probably
                                // data requests, but if we wanted to we'd say:
                                // cache.put(evt.request, response.clone());
                                return response;
                            })
                        });
                    })
    );
});