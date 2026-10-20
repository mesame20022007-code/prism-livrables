/* Histoires d'Ama : hors connexion. Pages = reseau d'abord ; images/audios = cache d'abord ; gere les requetes Range (audio). */
var V='ama-v2', M='ama-media-v2';
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(V).then(function(c){return c.addAll(['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png']);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==V&&k!==M;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));
});
function ranged(req){
  return caches.match(req.url).then(function(m){
    if(!m) return fetch(req);
    return m.arrayBuffer().then(function(buf){
      var r=/bytes=(\d+)-(\d*)/.exec(req.headers.get('range')||'')||[0,0,''];
      var s=+r[1], en=r[2]?+r[2]:buf.byteLength-1, sl=buf.slice(s,en+1);
      return new Response(sl,{status:206,statusText:'Partial Content',headers:{'Content-Type':m.headers.get('Content-Type')||'audio/mpeg','Content-Range':'bytes '+s+'-'+(s+sl.byteLength-1)+'/'+buf.byteLength,'Content-Length':String(sl.byteLength)}});
    });
  });
}
self.addEventListener('fetch',function(e){
  var req=e.request; if(req.method!=='GET') return;
  var u=new URL(req.url); if(u.origin!==self.location.origin) return;
  if(req.headers.has('range')){ e.respondWith(ranged(req)); return; }
  if(/\/(img|audio)\//.test(u.pathname)){
    e.respondWith(caches.match(req).then(function(m){
      return m||fetch(req).then(function(r){ if(r&&r.status===200){var cp=r.clone(); caches.open(M).then(function(c){c.put(req,cp);});} return r; });
    }));
    return;
  }
  e.respondWith(fetch(req).then(function(r){
    if(r&&r.status===200){var cp=r.clone(); caches.open(V).then(function(c){c.put(req,cp);});} return r;
  }).catch(function(){ return caches.match(req).then(function(m){return m||caches.match('index.html');}); }));
});
