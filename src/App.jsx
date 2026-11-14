import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {onFrameLoad,render,store} from './axiom-bridge.js';
import Result from './Result.jsx';
import Welcome,{Guide,Icon,Mark} from './Welcome.jsx';

const EXAMPLES=[
  ['分子形状','NH₃ 有三个 N—H 键，为什么不是平面三角形？'],
  ['晶胞计数','面心立方晶胞里有几个原子？我数了14个。'],
  ['大π键','苯分子的大π键怎么写？'],
];
export default function App(){
  const state=useSyncExternalStore(store.subscribe,store.get);
  // 保留不受控输入，兼容原有录屏与自动验收。
  const query=useRef(null),frame=useRef(null);
  const [workspace,setWorkspace]=useState(false),[ready,setReady]=useState(false);
  useEffect(()=>{const timer=setInterval(()=>{if(frame.current?.contentWindow?.AXIOM){setReady(true);clearInterval(timer);}},200);return ()=>clearInterval(timer);},[]);
  useEffect(()=>{if(state.result)setWorkspace(true);},[state.renderId]);
  useEffect(()=>{if(workspace)requestAnimationFrame(()=>frame.current?.contentWindow?.dispatchEvent(new Event('resize')));},[workspace]);
  function fillExample(q){query.current.value=q;query.current.focus();}
  function openModule(id){
    const doc=frame.current?.contentDocument;
    const target=doc?.querySelector(id==='cards'?'#knowledge-open':'#module-'+id);
    if(!ready||!target){store.set({message:'工作区正在载入，请稍后再试。'});return;}
    setWorkspace(true);
    requestAnimationFrame(()=>{target.click();frame.current.contentWindow.scrollTo(0,0);frame.current.focus();});
  }
  async function submit(event){
    event.preventDefault();
    setWorkspace(true);
    store.set({busy:true,message:'正在诊断…'});
    try{
      const response=await fetch('/api/diagnose',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:query.current.value})});
      const r=await response.json();
      if(!response.ok)throw Error(r.message);
      render(r);
    }catch(err){store.set({message:err.message||'本地服务不可用，请检查启动状态'});}
    finally{store.set({busy:false});}
  }
  async function switchCard(target,from){
    try{
      const response=await fetch('/api/card/'+encodeURIComponent(target.id)+'?query='+encodeURIComponent(query.current.value));
      if(!response.ok)throw Error();
      const next=await response.json();
      next.alternatives=[{id:from.card.id,point:from.card.point},...from.alternatives.filter(x=>x.id!==target.id)].slice(0,2);
      render(next);
    }catch{store.set({message:'切换失败，请重试'});}
  }
  return <>
    <header className="app-header"><strong>AXIOM <span>诊断台</span></strong><small>从疑问出发，看见化学结构</small><div className="header-actions"><button type="button" className="help-button" onClick={()=>{setWorkspace(false);query.current.focus();}}>◎ 使用引导</button><b id="mode"><Icon/>{state.mode}</b></div></header>
    <main className={workspace?'diagnosis-layout is-workspace':'diagnosis-layout'}>
      <section className={'model '+(workspace?'workspace-active':'welcome-active')} aria-label="化学探索工作区">
        <div className="workspace-bar" hidden={!workspace}><span><Mark/> AXIOM LAB <small>· 三维与知识工作区</small></span><button type="button" onClick={()=>setWorkspace(false)}>⌂ 返回欢迎页</button></div>
        <div className="frame-shell" aria-hidden={!workspace} inert={!workspace}>
          <iframe ref={frame} id="axiom" title="AXIOM 三维模型" src="axiom/AXIOM_Lab.html#app" onLoad={onFrameLoad} tabIndex={workspace?0:-1}/>
        </div>
        {!workspace&&<Welcome onModule={openModule} onExample={fillExample} ready={ready}/>}
      </section>
      <aside aria-label="问题诊断">
        <form id="form" onSubmit={submit}><label htmlFor="query">你的问题，或你认为的答案</label>
          <textarea id="query" ref={query} className={state.compact?'compact':undefined} maxLength={4000} required placeholder="例如：NH₃ 有三个 N—H 键，为什么不是平面三角形？"/>
          <div id="examples">{EXAMPLES.map(([label,q])=><button key={label} type="button" onClick={()=>fillExample(q)}>{label}</button>)}</div>
          <button id="submit" disabled={state.busy}><Icon/>{state.busy?'正在诊断…':'开始诊断 →'}</button>
        </form>
        <p id="message" role="status">{state.message}</p>
        <div id="result" aria-live="polite">{state.result?<Result key={state.renderId} result={state.result} status={state.status} viewTrace={state.viewTrace} onSwitch={switchCard}/>:<Guide/>}</div>
      </aside>
    </main>
  </>;
}
