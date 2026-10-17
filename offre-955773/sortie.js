/* Question de sortie « Qu'est-ce qui te fait hésiter ? » (landing + démo).
   Une seule fois par visite, jamais après un clic d'achat. Déclencheurs : souris qui sort par le haut (ordinateur),
   remontée rapide vers le haut après `delai` ms (téléphone), ou le lien « Pas convaincu(e) ? ».
   Chaque réponse est comptée (événements cc_raison_xxx, lus avec bilan_landing.py) et reçoit une réponse utile. */
(function(){
  var FAIT='cc_sortie_fait', vu=false;
  function ev(n){try{if(window.suiviEv) window.suiviEv(n);}catch(e){}}
  function deja(){try{return sessionStorage.getItem(FAIT);}catch(e){return vu;}}
  function marquer(){vu=true; try{sessionStorage.setItem(FAIT,'1');}catch(e){}}
  var OPTS=[
    ['prix','C’est trop cher pour moi'],
    ['marche','Je ne suis pas sûre que ça marche pour moi'],
    ['confiance','Je n’ai pas confiance (paiement, arnaque…)'],
    ['telephone','J’ai peur que ça ne marche pas sur mon téléphone'],
    ['besoin','Je n’en ai pas vraiment besoin'],
    ['reflechir','Je veux réfléchir'],
    ['autre','Autre chose']
  ];
  var WA='https://wa.me/2290193388631?text='+encodeURIComponent('Bonjour Elysée, une question sur le cahier de crédit : ');
  function rep(code,lieu){
    var demo = lieu==='demo' ? '' : '<a class="sx-b" href="demo/'+location.search+'" data-ev="sortie_demo">Essayer la démo du cahier</a>';
    var offre = lieu==='demo' ? '../'+(location.search?location.search+'&':'?')+'from=sortie#offre' : '#offre';
    var r={
      prix:'Je comprends. Regarde-le comme ça : si un seul client te paie grâce à une relance, le cahier est déjà remboursé plusieurs fois. Et c’est un paiement unique, pas un abonnement.<a class="sx-b" href="'+offre+'" data-ev="sortie_offre">Voir le prix de lancement</a>',
      marche:'Le plus simple : essaie-le avec des clients d’exemple, sans rien payer. Tu verras qui relancer, le message prêt, la preuve des paiements.'+demo,
      confiance:'Tu as raison de faire attention. Le paiement passe par Chariow, et tu peux m’écrire avant de payer : je réponds moi-même.<a class="sx-b" href="'+WA+'" target="_blank" rel="noopener" data-ev="sortie_wa">Écrire à Elysée sur WhatsApp</a>',
      telephone:'Il marche sur presque tous les smartphones (Chrome ou Safari), même sans internet après l’installation. Et avec la Garantie Ça-marche, s’il ne marche pas chez toi, je m’en occupe avec toi jusqu’à ce qu’il marche.'+demo,
      besoin:'Merci pour ta réponse 🙏 Si un jour un client tarde à te payer, la page reste là.',
      reflechir:'Bien sûr. Garde juste en tête qu’une dette devient plus dure à récupérer avec le temps, et que le prix de lancement a une vraie date de fin.'+demo,
      autre:'Dis-moi en un message ce qui te bloque, ça m’aide vraiment à améliorer le cahier.<a class="sx-b" href="'+WA+'" target="_blank" rel="noopener" data-ev="sortie_wa">Écrire à Elysée sur WhatsApp</a>'
    };
    return r[code]||r.autre;
  }
  function envoyer(lieu,c,autre,det){
    try{
      var T=(window.SUIVI_CFG||{}).track; if(!T) return;
      var P=new URLSearchParams(location.search), v=''; try{v=sessionStorage.getItem('cc_visit')||'';}catch(e){}
      var q='action=raison&v='+encodeURIComponent(v)+'&lieu='+lieu+'&choix='+encodeURIComponent(c.join(','))+
        '&autre='+encodeURIComponent(String(autre||'').slice(0,300))+'&det='+encodeURIComponent(String(det||'').slice(0,1000))+
        '&src='+encodeURIComponent((P.get('src')||'')+'|'+(P.get('c')||''));  /* « c » est refusé par Apps Script : campagne jointe à src */
      new Image().src=T+'?'+q;
    }catch(e){}
  }
  function css(){
    if(document.getElementById('sx-css')) return;
    var st=document.createElement('style'); st.id='sx-css';
    st.textContent='#sx{position:fixed;inset:0;z-index:120;background:#000b;display:flex;align-items:flex-end;justify-content:center}'+
      '#sx .sx-p{background:#fff;color:#1c1530;max-width:520px;width:100%;border-radius:18px 18px 0 0;padding:18px 16px 22px;font:16px/1.45 system-ui,sans-serif;max-height:88vh;overflow:auto}'+
      '#sx h4{margin:0 0 4px;font-size:19px}#sx .sx-o{display:block;width:100%;text-align:left;margin:8px 0 0;padding:12px 14px;border:1px solid #ddd;border-radius:12px;background:#faf8f2;font-size:15.5px;color:#1c1530}'+
      '#sx .sx-b{display:block;text-align:center;margin-top:14px;background:#f5c542;color:#1a1408;border-radius:12px;padding:13px;font-weight:800;text-decoration:none}'+
      '#sx .sx-x{display:block;width:100%;margin-top:10px;background:none;border:0;color:#666;font-size:15px;padding:8px}'+
      '#sx label.sx-o{display:flex;gap:10px;align-items:center;cursor:pointer}#sx label.sx-o input{width:20px;height:20px;flex:none;accent-color:#c9971c}'+
      '#sx .sx-t{display:block;width:100%;box-sizing:border-box;margin-top:10px;padding:11px 12px;border:1px solid #ccc;border-radius:12px;font:15px system-ui,sans-serif}';
    document.head.appendChild(st);
  }
  function ouvrir(lieu,source){
    if(deja()) return; marquer(); css(); ev('sortie_ouverte_'+source);
    var d=document.createElement('div'); d.id='sx';
    d.innerHTML='<div class="sx-p"><h4>Avant de partir 🙂</h4><p style="margin:0 0 6px;color:#555">Qu’est-ce qui te fait hésiter ? Coche ce qui te correspond (plusieurs choix possibles). C’est anonyme et ça m’aide à améliorer le cahier.</p>'+
      OPTS.map(function(o){return '<label class="sx-o"><input type="checkbox" value="'+o[0]+'"> '+o[1]+'</label>';}).join('')+
      '<input class="sx-t" id="sx-autre" maxlength="300" placeholder="Autre chose : écris-le ici" style="display:none">'+
      '<textarea class="sx-t" id="sx-det" maxlength="1000" rows="3" placeholder="Dis-m’en plus si tu veux (facultatif)" style="display:none"></textarea>'+
      '<button type="button" class="sx-b sx-send" style="width:100%;border:0;font-size:16px;opacity:.45" disabled>Envoyer ma réponse</button>'+
      '<button type="button" class="sx-x">Fermer</button></div>';
    document.body.appendChild(d);
    function choix(){return [].map.call(d.querySelectorAll('input[type=checkbox]:checked'),function(c){return c.value;});}
    d.addEventListener('change',function(){
      var c=choix(), send=d.querySelector('.sx-send');
      d.querySelector('#sx-autre').style.display = c.indexOf('autre')>-1 ? 'block' : 'none';
      d.querySelector('#sx-det').style.display = c.length ? 'block' : 'none';
      send.disabled=!c.length; send.style.opacity=c.length?1:.45;
    });
    d.addEventListener('click',function(e){
      if(e.target.closest('.sx-send')){
        var c=choix(); if(!c.length) return;
        c.forEach(function(x){ev('raison_'+x);});
        envoyer(lieu,c,d.querySelector('#sx-autre').value,d.querySelector('#sx-det').value);
        d.querySelector('.sx-p').innerHTML='<h4>Merci 🙏</h4><p style="margin:6px 0 0">'+rep(c[0],lieu)+'</p><button type="button" class="sx-x">Fermer</button>'; return;
      }
      if(e.target.closest('.sx-x')||e.target===d){ ev('sortie_fermee'); d.remove(); }
      var a=e.target.closest('a'); if(a && a.getAttribute('href')&&a.getAttribute('href').charAt(0)==='#') d.remove();
    });
  }
  window.SORTIE_INIT=function(o){
    o=o||{}; var lieu=o.lieu||'landing', delai=o.delai||30000, t0=Date.now(), achat=false;
    document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-ev]'); if(t&&/checkout|cta|buy|offre/.test(t.getAttribute('data-ev'))) achat=true;},true);
    function pret(){return !achat && Date.now()-t0>delai;}
    document.addEventListener('mouseout',function(e){ if(!e.relatedTarget && e.clientY<=0 && pret()) ouvrir(lieu,'souris'); });
    var lastY=window.scrollY, lastT=Date.now();
    window.addEventListener('scroll',function(){
      var y=window.scrollY, t=Date.now();
      if(lastY-y>500 && t-lastT<700 && y<lastY && pret()) ouvrir(lieu,'remontee');
      if(t-lastT>300){lastY=y; lastT=t;}
    },{passive:true});
    window.SORTIE_OUVRIR=function(){ouvrir(lieu,'lien');};
  };
})();
