// Capacitor injects its native bridge before loading the bundled page.
// The browser/PWA branch below keeps the existing storage and install behavior.
if(window.Capacitor?.isNativePlatform?.()){
 document.querySelector('#installApp').hidden=true;
}else{
let installPrompt=null;
const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
function updateInstallState(){const button=document.querySelector('#installApp');button.hidden=standalone();}
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;document.querySelector('#installAction').hidden=false;});
window.addEventListener('appinstalled',()=>{installPrompt=null;document.querySelector('#installStatus').textContent='ホーム画面に追加されました。アイコンから開けます。';document.querySelector('#installAction').hidden=true;updateInstallState();});
document.querySelector('#installApp').onclick=()=>{
 const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 document.querySelector('#installGuide').innerHTML=ios?'<ol><li>このサイトを<strong>Safari</strong>で開く。</li><li>メニューの<strong>共有</strong>を押す。</li><li><strong>ホーム画面に追加</strong>を選び、「Webアプリとして開く」が表示されたらオンにして<strong>追加</strong>。</li></ol><p><a href="https://support.apple.com/ja-jp/guide/iphone/iphea86e5236/ios" target="_blank" rel="noopener">Appleの手順を見る ↗</a></p>':'<ol><li>スマホの<strong>Chrome</strong>でこのサイトを開く。</li><li>下の「インストール」を押すか、ブラウザーの<strong>︙ → アプリをインストール／ホーム画面に追加</strong>を選ぶ。</li><li>ホーム画面の「冷蔵庫日和」から開く。</li></ol><p class="muted">PCではChrome・Edgeのアドレスバーやメニューからインストールできます。アプリ内ブラウザーでは、SafariやChromeで開き直してください。</p>';
 document.querySelector('#installStatus').textContent=standalone()?'すでにアプリとして開いています。':'';
 document.querySelector('#installAction').hidden=!installPrompt;
 document.querySelector('#installDialog').showModal();
};
document.querySelector('#closeInstall').onclick=()=>document.querySelector('#installDialog').close();
document.querySelector('#installAction').onclick=async()=>{
 if(!installPrompt)return;
 const prompt=installPrompt;installPrompt=null;document.querySelector('#installAction').hidden=true;
 try{await prompt.prompt();const {outcome}=await prompt.userChoice;document.querySelector('#installStatus').textContent=outcome==='accepted'?'追加の手続きを受け付けました。ホーム画面を確認してください。':'インストールはキャンセルされました。ブラウザーからもそのまま使えます。';}
 catch{document.querySelector('#installStatus').textContent='ブラウザーのメニューから「ホーム画面に追加」を選んでください。';}
};
updateInstallState();
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).catch(()=>{document.querySelector('#installStatus').textContent='オフライン機能を準備できませんでした。通信できる状態で開き直してください。';});}
}
