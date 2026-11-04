// 诊断结果与 AXIOM iframe 之间的通信。这里不依赖 React，只通过 store 把状态交给界面。
import {filterLayers,modelStatus} from '../public/model-view.js';

const listeners=new Set();
let snapshot={mode:'知识库检索',message:'',busy:false,compact:false,result:null,renderId:0,status:'',viewTrace:null};
export const store={
  get:()=>snapshot,
  set(patch){snapshot={...snapshot,...patch};for(const notify of listeners)notify();},
  subscribe(notify){listeners.add(notify);return ()=>listeners.delete(notify);},
};

const frame=()=>document.querySelector('#axiom');
let current=null,pending=null,timer,fromQuery=false,fallback=false;

export function openModel(){
  if(!current?.axiom&&!current?.view?.axiom)return;
  fallback=false;
  fromQuery=current.view?.from==='query';
  pending=current.view?.axiom||current.axiom;
  if(fromQuery){
    try{pending=filterLayers(pending,frame().contentWindow.AXIOM.catalog());current.view.axiom=pending;}
    catch{pending={species:pending.species};}
  }
  frame().contentWindow.postMessage({type:'axiom:open',...pending},'*');
  store.set({status:'正在打开模型…'});
  clearTimeout(timer);
  timer=setTimeout(()=>store.set({status:'模型未响应，请稍后点击重试'}),12000);
}

export function onFrameLoad(event){
  try{
    const doc=event.currentTarget.contentDocument;
    if(doc?.querySelector('.ax-hero')){
      const style=doc.createElement('style');
      style.textContent='.ax-hero{display:none!important}';
      doc.head.append(style);
    }
  }catch{}
  if(current?.axiom||current?.view?.axiom)openModel();
}

window.addEventListener('message',e=>{
  if(e.source!==frame()?.contentWindow||e.data?.type!=='axiom:result')return;
  clearTimeout(timer);
  // 按问题替换的模型打不开时，退回卡片预设的模型，只退一次。
  if(!e.data.ok&&fromQuery&&!fallback&&current.axiom){
    fallback=true;fromQuery=false;pending=current.axiom;
    current.view={...current.view,from:'card',axiom:pending};
    if(current.trace)current.trace.view={from:'card',species:pending?.species||''};
    frame().contentWindow.postMessage({type:'axiom:open',...pending},'*');
    return;
  }
  window.lastAxiomResult=e.data;
  window.actualView=pending;
  store.set({
    viewTrace:'三维：'+(pending?.species||pending?.card||'无')+' · '+(fromQuery?'来自问题':'来自卡片')+(fallback?'（替换失败，已退回）':''),
    status:e.data.ok?modelStatus(current.view?.query_species,e.data.state?.species||pending?.species||pending?.card,fromQuery):String(e.data.message||e.data.error||'打开失败'),
  });
});

// 展示一次诊断结果。renderId 让结果区域整体重建，折叠状态回到初始。
export function render(r){
  current=r;
  window.diagnosisResult=r;
  store.set({
    mode:r.mode==='ai'?'AI 诊断':'知识库检索',
    message:r.message||'',
    compact:true,
    result:r,
    renderId:snapshot.renderId+1,
    status:'',
    viewTrace:null,
  });
  if(r.card&&(r.view?.axiom||r.axiom))openModel();
}
