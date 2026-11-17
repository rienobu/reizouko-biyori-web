(function(){
 const root=document.documentElement,body=document.body;
 let frame=0,locked=false,savedScroll=0;
 const mobile=()=>window.matchMedia('(max-width: 650px), (max-height: 500px) and (pointer: coarse)').matches;
 function revealField(){
  const field=document.activeElement,dialog=field?.closest('dialog[open]');
  if(!dialog||!field.matches('input,select,textarea'))return;
  const rect=field.getBoundingClientRect(),bounds=dialog.getBoundingClientRect();
  const header=dialog.querySelector('.modal-head')?.getBoundingClientRect().height||0;
  const footer=dialog.querySelector('.modal-actions')?.getBoundingClientRect().height||0;
  if(rect.bottom>bounds.bottom-footer-12)dialog.scrollTop+=rect.bottom-(bounds.bottom-footer-12);
  else if(rect.top<bounds.top+header+12)dialog.scrollTop-=bounds.top+header+12-rect.top;
 }
 function measure(){
  frame=0;const viewport=window.visualViewport;
  root.style.setProperty('--visible-height',`${Math.round(viewport?.height||window.innerHeight)}px`);
  root.style.setProperty('--visible-top',`${Math.round(viewport?.offsetTop||0)}px`);
  const editing=document.activeElement?.matches('input,select,textarea');
  body.classList.toggle('keyboard-open',!!editing&&window.innerHeight-(viewport?.height||window.innerHeight)>150);
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(measure)}
 function dialogsChanged(){
  const open=!!document.querySelector('dialog[open]');
  if(open&&!locked){
   locked=true;savedScroll=window.scrollY;
   body.classList.add('modal-open');
   if(mobile()){body.classList.add('modal-scroll-locked');body.style.top=`-${savedScroll}px`;}
  }else if(!open&&locked){
   locked=false;const restore=body.classList.contains('modal-scroll-locked');
   body.classList.remove('modal-open','modal-scroll-locked');body.style.top='';
   if(restore)window.scrollTo(0,savedScroll);
  }
  schedule();
 }
 new MutationObserver(dialogsChanged).observe(body,{subtree:true,attributes:true,attributeFilter:['open']});
 document.addEventListener('focusin',()=>{schedule();requestAnimationFrame(revealField)});
 document.addEventListener('focusout',schedule);
 window.visualViewport?.addEventListener('resize',()=>{schedule();requestAnimationFrame(revealField)});
 window.visualViewport?.addEventListener('scroll',schedule);
 for(const event of ['resize','orientationchange','pageshow','focus'])window.addEventListener(event,schedule);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){schedule();requestAnimationFrame(revealField)}});
 // Never rebuild the form on resume: camera/permission dialogs must preserve the draft.
 measure();dialogsChanged();
})();
