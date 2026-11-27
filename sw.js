const scope=new URL(self.registration.scope);
const prefix='fridge-biyori-web:'+scope.pathname+':';
const CACHE=prefix+'v2';
const FILES=['/','/index.html','/privacy.html','/support.html','/help.css','/style.css','/recipes.css','/mobile.css','/recipes.js','/recipe-library.js','/food-policy.js','/app.js','/pwa.js','/mobile-ui.js','/manifest.webmanifest','/icons/icon-192.png','/icons/icon-512.png','/icons/icon-maskable-512.png','/icons/apple-touch-icon.png'];
const paths=new Map(FILES.map(path=>[new URL('.'+path,scope).pathname,path]));
async function safeResponse(response,path){if(!response||!response.ok||response.redirected)return false;const type=response.headers.get('content-type')||'';if(path==='/'||path.endsWith('.html'))return type.includes('text/html')&&(await response.clone().text()).includes('name="application-name" content="冷蔵庫日和"');return !type.includes('text/html');}
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await Promise.all(FILES.map(async path=>{const response=await fetch(new Request(new URL('.'+path,scope),{cache:'reload',credentials:'same-origin'}));if(!await safeResponse(response,path))throw new Error('App shell unavailable');await cache.put(new URL('.'+path,scope).href,response);}));await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{await Promise.all((await caches.keys()).filter(key=>key.startsWith(prefix)&&key!==CACHE).map(key=>caches.delete(key)));await self.clients.claim();})()));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||!paths.has(url.pathname))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(event.request);if(await safeResponse(response,paths.get(url.pathname)))await cache.put(url.pathname,response.clone());return response;}catch{const cached=await cache.match(url.pathname);if(cached)return cached;return new Response('通信できません。接続後にもう一度開いてください。',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}})());
});
