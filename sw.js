const CACHE="contas-pwa-v22";
const BASE=new URL("./",self.location.href);
const ASSETS=["","index.html","styles.css?v=1041","app.js?v=1041","history.js?v=1041","manifest.webmanifest","icon-192.png","icon-512.png"].map(x=>new URL(x,BASE).href);

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;
  event.respondWith(
    fetch(event.request).then(response=>{
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(event.request,copy));
      return response;
    }).catch(()=>caches.match(event.request).then(hit=>hit||caches.match(new URL("index.html",BASE).href)))
  );
});
