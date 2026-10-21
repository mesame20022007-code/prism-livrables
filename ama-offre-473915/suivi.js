/* Suivi du parcours (même méthode que la landing Physique) : un ping par étape atteinte, vers la feuille « Sections ».
   Ne suit QUE les visites venant d'une annonce ou d'un lien codé (?src=...). Un aperçu sans ?src= n'envoie rien.
   Lecture des résultats : outils/bilan_landing.py */
(function(){
  try{
    var P=new URLSearchParams(location.search);
    var cln=function(x,n){return String(x||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,n||12);};
    var src=cln(P.get('src')), camp=cln(P.get('c')||P.get('utm_campaign'),14);
    if(!src && !camp) return;                               /* aperçu / test : on ne mesure pas */
    var CFG=window.SUIVI_CFG||{}, TRACK=CFG.track, PF=CFG.prefix||'cc_';
    var K='cc_visit', visit=''; try{visit=sessionStorage.getItem(K)||'';}catch(e){}
    if(!visit){ visit='v'+Date.now().toString(36)+Math.random().toString(36).slice(2,8); try{sessionStorage.setItem(K,visit);}catch(e){} }
    var vu={};
    function cl(){try{window.clarity&&window.clarity.apply(null,arguments);}catch(e){}}
    function ev(nom){
      if(vu[nom]) return; vu[nom]=1;
      var n=(PF+String(nom)).replace(/[^a-z0-9_-]/gi,'').slice(0,40);
      if(TRACK){ try{ new Image().src=TRACK+'?action=track&v='+encodeURIComponent(visit)+'&s='+encodeURIComponent(n); }catch(e){} }
      cl('event',n);
    }
    window.suiviEv=ev;
    /* Clarity (cartes de chaleur, enregistrements) : chargé seulement pour les visites mesurées */
    if(CFG.clarity){ (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",CFG.clarity); cl('set','produit','cahier'); cl('set','src',src); if(camp) cl('set','campagne',camp); }
    /* Pixel Meta : seulement pour les visites mesurées */
    if(CFG.pixel){ !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js'); window.fbq('init',CFG.pixel); window.fbq('track','PageView'); window.fbq('track','ViewContent',{content_name:'cahier-credit'}); }
    ev('src_'+(src||'none')); if(camp) ev('camp_'+camp); if(P.get('fbclid')) ev('fbclid_oui');
    /* clics importants (attribut data-ev sur le bouton) */
    document.addEventListener('click',function(e){
      var t=e.target&&e.target.closest&&e.target.closest('[data-ev]'); if(!t) return;
      var n=t.getAttribute('data-ev'); ev('ev_'+n);
      if(window.fbq){ if(n==='checkout') window.fbq('track','InitiateCheckout'); if(n==='wa') window.fbq('track','Contact'); }
    },true);
    /* sections vues */
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){es.forEach(function(x){ if(x.isIntersecting){ ev('vu_'+x.target.getAttribute('data-s')); io.unobserve(x.target);} });},{threshold:.35});
      [].forEach.call(document.querySelectorAll('[data-s]'),function(s){io.observe(s);});
    }
    /* profondeur, temps réellement visible, sortie */
    var maxS=0;
    function prof(){ var h=document.documentElement, r=(scrollY+innerHeight)/h.scrollHeight*100; if(r>maxS) maxS=r; [25,50,75,90].forEach(function(k){ if(r>=k) ev('scroll'+k); }); }
    addEventListener('scroll',prof,{passive:true});
    var sec=0; setInterval(function(){ if(document.visibilityState!=='visible') return; sec++;
      if(sec===10&&maxS<35) ev('inactif10');
      [15,30,60,120].forEach(function(k){ if(sec===k) ev('t'+k); }); },1000);
    addEventListener('pagehide',function(){
      var b=maxS<25?0:maxS<50?25:maxS<75?50:maxS<90?75:90;
      if(TRACK){ try{ fetch(TRACK+'?action=track&v='+encodeURIComponent(visit)+'&s='+PF+'sortie_s'+b,{mode:'no-cors',keepalive:true}); }catch(e){} }
    });
  }catch(e){}
})();
