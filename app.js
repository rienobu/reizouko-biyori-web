const $=s=>document.querySelector(s),key='fridge-biyori-v1';
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date());
const date=s=>new Date(s+'T12:00:00'),plus=(s,n)=>{let d=date(s);d.setDate(d.getDate()+n);return iso(d)},diff=(a,b)=>Math.round((date(a)-date(b))/86400000);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nativeDataStore=globalThis.FridgePersistence?.isIOS?globalThis.FridgePersistence.create({legacyStorage:localStorage}):null;
globalThis.FridgeNativeStorage=nativeDataStore;
let items=[],dataLoaded=false;
 let foodMutationQueue=Promise.resolve(),resolveFoodReady,loadingFoodData=false;
 function loadWebFoods(){
  try{
   const raw=localStorage.getItem(key);
   const stored=raw==null?[]:JSON.parse(raw);
   if(!Array.isArray(stored)||stored.some(item=>!item||
    typeof item.id!=='string'||typeof item.name!=='string'||
    !['food','dish'].includes(item.type)||
    typeof item.registered!=='string'||typeof item.notice!=='string'||
    (item.type==='food'&&typeof item.expiry!=='string')||
    (item.done!=null&&typeof item.done!=='string')))throw Error('Invalid food data');
   items=stored;
   dataLoaded=true;
   document.querySelector('#storageNotice').hidden=true;
   if(migrateFoodEstimates(items))save();
  }catch{
   dataLoaded=false;
   storageMessage('保存したデータを読み込めませんでした。元のデータを保護するため、登録と変更を停止しています。');
  }
  $('#add').disabled=!dataLoaded;
  $('#samples').disabled=!dataLoaded;
  render();
 }
globalThis.FridgeDataReady=nativeDataStore?new Promise(resolve=>{resolveFoodReady=resolve}):Promise.resolve(true);
let selected=today(),month=date(selected),view='calendar',undo=null,photoData=null,sourceImage=null,cropStart=null,toastTimer;
let nativePhotoBusy=false,photoDisabledStates=[];
function setNativePhotoBusy(busy){
 nativePhotoBusy=busy;
 if(busy){photoDisabledStates=Array.from($('#form').elements||[]).map(control=>[control,control.disabled]);for(const [control] of photoDisabledStates)control.disabled=true;}
 else{for(const [control,disabled] of photoDisabledStates)control.disabled=disabled;photoDisabledStates=[];}
}
function photoSource(item){return item.photoFile?(globalThis.FridgePhotoUrls?.[item.photoFile.path]||item.photo||null):item.photo;}
function finishFoodRegistration(item){
 return persistFoodMutation(next=>{if(next.some(i=>i.id===item.id))return false;next.push(item)},()=>{
  $('#register').close();selected=item.notice;month=date(item.notice);view='calendar';render();toast(`${item.name}を登録しました。`);
 });
}
async function storeNativeFoodRegistration(item){
 if(nativePhotoBusy)return false;setNativePhotoBusy(true);
 try{
  const data=await normaliseNativePhoto(photoData);
  await globalThis.FridgePhotoStore.savePhoto(data,ref=>finishFoodRegistration({...item,photo:null,photoFile:ref}));
  await globalThis.refreshNativePhotos?.();return true;
 }catch{toast('写真を保存できませんでした。登録は完了していません。再試行するか、写真なしで登録してください。');return false;}
 finally{setNativePhotoBusy(false);}
}
async function deleteFoodRegistration(id){
 const item=items.find(i=>i.id===id);if(!item||!globalThis.FridgePhotoStore?.isIOS)return false;
 const result=await globalThis.FridgePhotoStore.deleteRecord(item,()=>persistFoodMutation(next=>{
  const index=next.findIndex(i=>i.id===id);if(index<0)return false;next.splice(index,1);
 },()=>{if(undo?.id===id)undo=null}));
 render();toast(result.cleanupPending?'食材を削除しました。写真の整理は次回起動時に再試行します。':'食材と不要な写真を削除しました。');return true;
}
const limits={cabbage:7,meat:2,egg:7,vegetable:5,other:3};
function save(){if(nativeDataStore)return false;try{localStorage.setItem(key,JSON.stringify(items))}catch{alert('保存容量が足りません。写真を小さくして再度お試しください。');return false}globalThis.FridgeDeviceNotifications?.sync();return true}
function storageMessage(message){$('#retryStorage').hidden=dataLoaded;const panel=$('#storageNotice');panel.hidden=false;$('#storageNoticeStatus').textContent=message;}
function persistFoodMutation(change,after=()=>{}){
 if(!dataLoaded){storageMessage('データを読み込めていないため、変更していません。再読み込みしてください。');return nativeDataStore?Promise.resolve(false):false;}
 if(nativeDataStore){
  const operation=foodMutationQueue.then(async()=>{
   const next=nativeDataStore.getFoods();if(change(next)===false)return false;
   await nativeDataStore.writeFoods(next);items=next;
   $('#storageNotice').hidden=true;try{globalThis.FridgeDeviceNotifications?.sync();after()}catch{toast('保存は完了しました。表示を更新する場合はアプリを開き直してください。')}return true;
  }).catch(()=>{storageMessage('保存できませんでした。変更は反映していません。登録内容を確認して再試行してください。');toast('保存できませんでした。入力内容を残しています。再試行してください。');return false;});
  foodMutationQueue=operation.then(()=>{});return operation;
 }
 const previous=items,next=JSON.parse(JSON.stringify(items));if(change(next)===false)return false;items=next;
 if(!save()){items=previous;return false;}after();return true;
}
function updateFoodExpiry(id,expiry,deadlineType){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(expiry)||!Number.isFinite(date(expiry).getTime())||iso(date(expiry))!==expiry||!['use','best','estimate'].includes(deadlineType))return false;
 return persistFoodMutation(next=>{
  const index=next.findIndex(item=>item.id===id&&item.type==='food'&&!item.done);if(index<0)return false;
  const previous=next[index];next[index]={...previous,expiry,notice:plus(expiry,-1),retry:false,explicit:deadlineType!=='estimate',deadlineType:deadlineType==='estimate'?previous.deadlineType:deadlineType,policyVersion:2};
 },()=>render());
}
function label(x){return x.type==='dish'?'作り置き':x.explicit?(x.deadlineType==='use'?'消費期限':'賞味期限'):'使い切り目安'}
function emoji(x){return x.type==='dish'?'🍲':foodPolicy(x.name,x.category).icon}
function recipes(x){return notificationRecipes(x,items)}
function message(x){if(x.type==='dish'){if(!x.retry)return `${x.name}、もう食べた？`;return `${x.name}が登録から${diff(today()>x.notice?today():x.notice,x.registered)}日経っています。保存状態に不安がある場合は、食べずに処分してね。`}if(x.retry&&today()>x.expiry)return `${x.name}の${label(x)}を過ぎています。傷んでいないか確認してね。`;let n=diff(x.expiry,today());return `${x.name}の${label(x)}は${n===1?'明日':n===0?'今日':`${date(x.expiry).getMonth()+1}月${date(x.expiry).getDate()}日`}です。`}
function card(x){const src=photoSource(x);return `<article class="item"><div class="item-top">${src?`<img class="food-icon" src="${esc(src)}" alt="${esc(x.name)}">`:`<div class="food-icon">${emoji(x)}</div>`}<div><h3>${esc(x.name)}</h3><span class="tag">${label(x)}${x.type==='dish'?'':` · ${esc(x.expiry.replaceAll('-','/'))}`} ${x.retry?' / 再通知':''}</span></div></div><p>${esc(message(x))}</p>${x.type==='food'?`<p>${esc(x.name)}を使った料理：${esc(recipes(x))}<br><span class="tag">調味料や主食など、追加材料が必要な場合があります。</span></p>`:''}<div class="actions"><button data-done="${esc(x.id)}">${x.type==='dish'?'食べた':'使い切った'}</button><button data-remain="${esc(x.id)}">まだある</button>${globalThis.FridgeNotifications?.isIOS&&x.type==='food'?`<button data-edit-expiry="${esc(x.id)}">期限を変更</button>`:''}${globalThis.FridgePhotoStore?.isIOS?`<button data-delete-item="${esc(x.id)}">削除</button>`:''}</div></article>`}
function render(){if(!dataLoaded){$('#content').innerHTML='<div class="empty">保存した食材データを表示できません。</div>';return;}let active=items.filter(x=>!x.done);$('#total').innerHTML=active.length+'<small>品</small>';$('#soon').innerHTML=active.filter(x=>diff(x.expiry||x.notice,today())<=3).length+'<small>品</small>';$('#done').innerHTML=items.filter(x=>x.done&&x.done.slice(0,7)===today().slice(0,7)).length+'<small>品</small>';let due=active.filter(x=>x.notice<=today());document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===view));$('#heading').textContent=view==='calendar'?'冷蔵庫の予定を、ひと目で。':view==='stock'?'いま、冷蔵庫にあるもの。':'作りたい料理を、すぐに。';
$('.workspace').classList.toggle('recipe-mode',view==='recipe');if(view==='recipe'){renderRecipeSearch();return;}if(view==='calendar'){let y=month.getFullYear(),m=month.getMonth(),first=new Date(y,m,1,12),start=new Date(y,m,1-first.getDay(),12),cells='';for(let n=0;n<42;n++){let d=new Date(start);d.setDate(d.getDate()+n);let s=iso(d),events=active.filter(x=>x.notice===s||x.expiry===s);cells+=`<button class="cell ${d.getMonth()!==m?'out':''} ${s===today()?'today':''} ${s===selected?'selected':''}" data-day="${s}"><span class="num">${d.getDate()}</span>${events.slice(0,3).map(x=>`<span class="event ${x.type==='dish'?'dish':x.explicit?'explicit':''} ${x.retry?'retry':''}">${esc(x.name)}${x.notice===s?' · 通知':''}</span>`).join('')}${events.length>3?`<span class="tag">ほか${events.length-3}件</span>`:''}</button>`}$('#content').innerHTML=`<div class="cal-head"><h2>${y}年 <strong>${m+1}</strong>月</h2><div><button id="prev" aria-label="前の月">‹</button><button id="now">今日</button><button id="next" aria-label="次の月">›</button></div></div><div class="week">${['日','月','火','水','木','金','土'].map(x=>`<span>${x}</span>`).join('')}</div><div class="grid">${cells}</div>`;$('#prev').onclick=()=>{month=new Date(y,m-1,1,12);render()};$('#next').onclick=()=>{month=new Date(y,m+1,1,12);render()};$('#now').onclick=()=>{selected=today();month=date(selected);render()}}
else $('#content').innerHTML=`<h2 class="list-title">${view==='stock'?'冷蔵庫の中':'届いているお知らせ'} <span class="tag">${view==='stock'?active.length:due.length}件</span></h2>${(view==='stock'?active:due).length?`<div class="${view==='stock'?'stock-grid':''}">${(view==='stock'?active:due).sort((a,b)=>a.notice.localeCompare(b.notice)).map(card).join('')}</div>`:`<div class="empty">${view==='stock'?'まだ食材がありません。<br>「写真から登録」から追加してみましょう。':'いま届いているお知らせはありません。'}</div>`}`;
let sd=date(selected);$('#dayTitle').textContent=`${sd.getMonth()+1}月${sd.getDate()}日（${'日月火水木金土'[sd.getDay()]}）`;let list=active.filter(x=>x.notice===selected||x.expiry===selected);$('#dayItems').innerHTML=list.length?list.map(card).join(''):'<div class="empty">この日の予定はありません。<br>食材を登録すると、通知日と期限がここに表示されます。</div>';
}
function toast(text,canUndo=false){const feedback=$('#registerFeedback');if($('#register').open){feedback.textContent=text;feedback.hidden=false;}else feedback.hidden=true;clearTimeout(toastTimer);$('#toast').innerHTML=esc(text)+(canUndo?'<button id="undo">元に戻す</button>':'');$('#toast').style.display='block';if(canUndo)$('#undo').onclick=()=>{const previous=undo;if(!previous)return false;return persistFoodMutation(next=>{const i=next.findIndex(x=>x.id===previous.id);if(i<0)return false;next[i]=previous},()=>{render();$('#toast').style.display='none'})};toastTimer=setTimeout(()=>$('#toast').style.display='none',7000)}
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.view){view=b.dataset.view;render()}if(b.dataset.day){selected=b.dataset.day;render()}
 if(b.dataset.done){let previous;return persistFoodMutation(next=>{const item=next.find(i=>i.id===b.dataset.done);if(!item)return false;previous={...item};item.done=today()},()=>{undo=previous;render();toast('一覧から外しました。通知も停止しました。',true)})}
 if(b.dataset.remain){let previous,days;return persistFoodMutation(next=>{const item=next.find(i=>i.id===b.dataset.remain);if(!item)return false;previous={...item};days=item.type==='dish'?1:3;item.notice=plus(today(),days);item.retry=true},()=>{undo=previous;render();toast((days===1?'翌日':'3日後')+'に再通知します。',true)})}
});
$('#add').onclick=()=>{if(!dataLoaded)return;$('#form').reset();$('#registerFeedback').hidden=true;$('#registered').value=today();$('#foodFields').hidden=false;$('#photoArea').hidden=true;$('#thumbnail').hidden=true;photoData=null;sourceImage=null;updateFoodEstimate();$('#register').showModal()};$('.close').onclick=()=>$('#register').close();$('#kind').onchange=()=>{$('#foodFields').hidden=$('#kind').value==='dish';$('#name').placeholder=$('#kind').value==='dish'?'例：肉じゃが（名前を入力）':'例：キャベツ';$('#dateHelp').textContent=$('#kind').value==='dish'?'登録から2日後に「もう食べた？」と通知します。':'使い切り目安と通知日は登録日から自動で設定します。'};
async function showFoodPhoto(bitmap){
 const c=$('#crop');c.width=Math.min(900,bitmap.width);c.height=Math.round(c.width*bitmap.height/bitmap.width);
 c.getContext('2d').drawImage(bitmap,0,0,c.width,c.height);const nextImage=await createImageBitmap(c);sourceImage?.close?.();sourceImage=nextImage;
 cropStart=null;selectedCrop=null;$('#cropStatus').textContent='写真全体を使います。指で囲むと、その部分だけを登録します。';photoData=c.toDataURL('image/jpeg',.65);$('#photoArea').hidden=false;$('#thumbnail').hidden=true;toast('登録する部分を囲み、名前を入力してください。');
}
async function handleFoodPhoto(e){let f=e.target.files[0];if(!f)return;if(!f.type.startsWith('image/')){toast('画像ファイルを選んでください。');return}let bitmap;try{bitmap=await createImageBitmap(f);await showFoodPhoto(bitmap)}catch{toast('写真を開けませんでした。JPEG・PNGでお試しください。')}finally{bitmap?.close?.();e.target.value=''}};
async function loadNativePhoto(path){
 const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=path});
 await showFoodPhoto(image);
}
async function normaliseNativePhoto(data){
 const bitmap=await createImageBitmap(await(await fetch(data)).blob());
 try{
  const c=document.createElement('canvas'),scale=Math.min(1,1280/Math.max(bitmap.width,bitmap.height));
  c.width=Math.max(1,Math.round(bitmap.width*scale));c.height=Math.max(1,Math.round(bitmap.height*scale));c.getContext('2d').drawImage(bitmap,0,0,c.width,c.height);
  return c.toDataURL('image/jpeg',.75);
 }finally{bitmap.close?.();}
}
$('#photo').onchange=handleFoodPhoto;$('#camera').onchange=handleFoodPhoto;
const canvas=$('#crop');function point(e){let r=canvas.getBoundingClientRect();return {x:Math.max(0,Math.min(canvas.width,(e.clientX-r.left)*canvas.width/r.width)),y:Math.max(0,Math.min(canvas.height,(e.clientY-r.top)*canvas.height/r.height))}}
let cropPointer=null,selectedCrop=null;
function drawCropSelection(){const ctx=canvas.getContext('2d');ctx.drawImage(sourceImage,0,0);if(selectedCrop){ctx.strokeStyle='#42694f';ctx.lineWidth=4;ctx.strokeRect(...selectedCrop)}}
canvas.onpointerdown=e=>{if(nativePhotoBusy||!sourceImage||cropStart)return;cropPointer=e.pointerId;cropStart=point(e);canvas.setPointerCapture(e.pointerId)};canvas.onpointermove=e=>{if(!cropStart||e.pointerId!==cropPointer)return;let p=point(e),ctx=canvas.getContext('2d');ctx.drawImage(sourceImage,0,0);ctx.strokeStyle='#42694f';ctx.lineWidth=4;ctx.strokeRect(cropStart.x,cropStart.y,p.x-cropStart.x,p.y-cropStart.y)};canvas.onpointerup=e=>{if(!cropStart||e.pointerId!==cropPointer)return;let p=point(e),x=Math.min(p.x,cropStart.x),y=Math.min(p.y,cropStart.y),w=Math.abs(p.x-cropStart.x),h=Math.abs(p.y-cropStart.y);cropStart=null;canvas.getContext('2d').drawImage(sourceImage,0,0);if(w<10||h<10){drawCropSelection();return;}selectedCrop=[x,y,w,h];let c=document.createElement('canvas');c.width=Math.min(300,w);c.height=Math.round(c.width*h/w);c.getContext('2d').drawImage(sourceImage,x,y,w,h,0,0,c.width,c.height);photoData=c.toDataURL('image/jpeg',.7);$('#thumbnail').src=photoData;$('#thumbnail').hidden=false;const ctx=canvas.getContext('2d');ctx.strokeStyle='#42694f';ctx.lineWidth=4;ctx.strokeRect(x,y,w,h);$('#cropStatus').textContent='囲んだ部分を登録します。「写真全体に戻す」で選び直せます。'};
canvas.onpointercancel=canvas.onlostpointercapture=()=>{if(cropStart){cropStart=null;if(sourceImage)drawCropSelection();}};
$('#resetCrop').onclick=()=>{if(nativePhotoBusy||!sourceImage)return;cropStart=null;selectedCrop=null;drawCropSelection();photoData=canvas.toDataURL('image/jpeg',.65);$('#thumbnail').hidden=true;$('#cropStatus').textContent='写真全体を使います。指で囲むと、その部分だけを登録します。'};
$('#form').onsubmit=e=>{e.preventDefault();if(nativePhotoBusy)return;let name=$('#name').value.trim();if(!name)return;let type=$('#kind').value,registered=$('#registered').value,policy=foodPolicy(name,$('#category').value),category=policy.category,explicit=type==='food'&&!!$('#expiry').value,expiry=type==='food'?(explicit?$('#expiry').value:plus(registered,policy.days)):plus(registered,2),notice=type==='dish'?expiry:plus(expiry,-1);let x={id:crypto.randomUUID(),name,type,registered,category,expiry,notice,explicit,deadlineType:$('#deadlineType').value,retry:false,photo:photoData,done:null,policyVersion:2};if(photoData&&globalThis.FridgePhotoStore?.isIOS)return storeNativeFoodRegistration(x);if(nativeDataStore){setNativePhotoBusy(true);return Promise.resolve(finishFoodRegistration(x)).finally(()=>setNativePhotoBusy(false));}return finishFoodRegistration(x)};
$('#samples').onclick=()=>persistFoodMutation(next=>{if(next.some(x=>x.sample)){toast('サンプルは追加済みです。');return false}const t=today();next.push(...[{name:'鶏肉',category:'meat',explicit:true,deadlineType:'use',expiry:plus(t,1),notice:t,type:'food',registered:t},{name:'卵',category:'egg',expiry:plus(t,6),notice:plus(t,5),type:'food',registered:t},{name:'キャベツ',category:'cabbage',expiry:plus(t,3),notice:plus(t,2),type:'food',registered:plus(t,-4)},{name:'肉じゃが',expiry:plus(t,1),notice:plus(t,1),type:'dish',registered:plus(t,-1)}].map(x=>({...x,id:crypto.randomUUID(),retry:false,done:null,sample:true})))},()=>{render();toast('サンプル4品を追加しました。')});
function enableNativeFoodData(loaded){
 items=loaded;
 dataLoaded=true;
 $('#storageNotice').hidden=true;
 $('#storageRecovery').hidden=true;
 $('#confirmRecovery').hidden=true;
 $('#add').disabled=false;
 $('#samples').disabled=false;
 render();
 resolveFoodReady(true);
}
async function showStorageRecovery(){
 const recovery=await nativeDataStore.inspectRecovery();
 const messages={
  available:'確認済みのバックアップから復元できます。',
  missing:'復元できるバックアップがありません。再読み込みをお試しください。',
  invalid:'バックアップの整合性を確認できません。復元はできません。',
  unreadable:'保存領域の読み取りに失敗しました。再読み込みをお試しください。',
  retry:'主データを読み取れる状態です。再読み込みをお試しください。',
  unavailable:'データの読み込みをもう一度お試しください。'
 };
 $('#recoveryStatus').textContent=messages[recovery.state];
 const details=$('#recoveryDetails');
 details.hidden=recovery.foodCount===undefined;
 if(!details.hidden){
  const date=recovery.savedAt?new Intl.DateTimeFormat('ja-JP',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Tokyo'}).format(new Date(recovery.savedAt))+'（日本時間）':'日時不明（旧形式）';
  details.textContent=`保存日時：${date}。復元対象：食材${recovery.foodCount}件、料理${recovery.dishCount}件、使い切った履歴${recovery.historyCount}件。`;
 }
 $('#openRecovery').hidden=recovery.state!=='available';
 $('#confirmRecovery').hidden=true;
 $('#storageRecovery').hidden=false;
}
async function restoreNativeFoodData(){
 if(dataLoaded||loadingFoodData||$('#confirmRecovery').hidden)return false;
 loadingFoodData=true;
 $('#restoreBackup').disabled=true;
 $('#cancelRecovery').disabled=true;
 $('#retryStorage').disabled=true;
 try{
  let loaded;
  try{loaded=await nativeDataStore.restoreBackup();}
  catch{
   await showStorageRecovery();
   $('#recoveryStatus').textContent='復元を確認できませんでした。データは保護されています。再読み込みするか、復元内容を確認し直してください。';
   return false;
  }
  enableNativeFoodData(loaded);
  const result=$('#recoveryResult');
  result.hidden=false;
  result.textContent='バックアップから復元しました。写真と通知予定を確認しています。';
  const [photos,notifications]=await Promise.allSettled([globalThis.FridgePhotosReady,globalThis.FridgeNotificationsReady]);
  const photoText=photos.status==='rejected'?'写真の確認に失敗しました。':photos.value>0?`表示できない写真が${photos.value}件あります。食材・料理の記録は保持しています。`:'';
  const noticeText=notifications.status==='rejected'||notifications.value?.state==='error'?'通知予定を確認できませんでした。通知欄のボタンで再確認してください。':'';
  result.textContent='バックアップから復元しました。'+photoText+noticeText;
  return true;
 }finally{
  loadingFoodData=false;
  $('#restoreBackup').disabled=false;
  $('#cancelRecovery').disabled=false;
  $('#retryStorage').disabled=false;
 }
}
async function initialiseFoodData(){
 if(!nativeDataStore||loadingFoodData)return false;loadingFoodData=true;
 $('#add').disabled=true;$('#samples').disabled=true;$('#retryStorage').disabled=true;
 $('#storageRecovery').hidden=true;$('#confirmRecovery').hidden=true;
 storageMessage('保存した食材データを読み込んでいます。');
 try{
  const loaded=await nativeDataStore.initialise();
  if(migrateFoodEstimates(loaded))await nativeDataStore.writeFoods(loaded);
  enableNativeFoodData(loaded);return true;
 }catch{
  storageMessage('データを読み込めませんでした。登録や編集を停止しています。');
  await showStorageRecovery();
  return false;
 }
 finally{loadingFoodData=false;$('#retryStorage').disabled=false;}
}
$('#name').oninput=updateFoodEstimate;$('#category').onchange=updateFoodEstimate;
if(nativeDataStore){
 $('#retryStorage').onclick=()=>globalThis.FridgeDataLoadAttempt=initialiseFoodData();
 $('#openRecovery').onclick=()=>{if(!loadingFoodData)$('#confirmRecovery').hidden=false;};
 $('#cancelRecovery').onclick=()=>{$('#confirmRecovery').hidden=true;};
 $('#restoreBackup').onclick=restoreNativeFoodData;
 globalThis.FridgeDataLoadAttempt=initialiseFoodData();
 render();
}
else{$('#retryStorage').onclick=loadWebFoods;loadWebFoods();}
setInterval(()=>{if(view!=='recipe')render()},60000);
