const staticCacheName = "s-app-v2";
const dynamicCacheName = "d-app-v2";

const assetsUrls = [
    "index.html",
    "/css/styles.css",
    "/js/app.js",
    "offline.html"
];

self.addEventListener("install", async event => {
    const cache = await caches.open(staticCacheName);
    cache.addAll(assetsUrls);

    // event.waitUntil(
    //     caches.open(staticCacheName).then(cache => cache.addAll(assetsUrls))
    // );
});

self.addEventListener("activate", async event=> {
    const cacheNames = await caches.keys();
    await Promise.all(
        cacheNames
        .filter(name => name !== staticCacheName)
        .filter(name => name !== dynamicCacheName)
        .map(name => caches.delete(name))
    );
});

self.addEventListener("fetch", event=> {
    console.log("Fetch", event.request.url);
    const {request} = event;
    const url = new URL(request.url);
    if(url.origin === location.origin){
        event.respondWith(cacheFirst(request));
    }
    else {
        event.respondWith(networkFirst(request));
    }
});

async function cacheFirst(request){
    const cached = await caches.match(request);
    return cached ?? await fetch(request);
}

async function networkFirst(request){
    const cache = await caches.open(dynamicCacheName);
    try {
        const response = await fetch(request);
        await cache.put(request, response.clone());
        return response;
    } catch (error) {
        const cached = await cache.match(request);
        return cached ?? await caches.match('/offline.html');
    }
    
}