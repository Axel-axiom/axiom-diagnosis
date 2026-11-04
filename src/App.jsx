import {useRef,useSyncExternalStore} from 'react';
import {onFrameLoad,render,store} from './axiom-bridge.js';
import Result from './Result.jsx';

const EXAMPLES=[
  ['分子形状','NH₃ 有三个 N—H 键，为什么不是平面三角形？'],
  ['晶胞计数','面心立方晶胞里有几个原子？我数了14个。'],
  ['大π键','苯分子的大π键怎么写？'],
];

export default function App(){
  const state=useSyncExternalStore(store.subscribe,store.get);
  // 输入框不受控：提交时才读取，和录屏、测试直接写入 value 的方式兼容。
  const query=useRef(null);

  async function submit(event){
    event.preventDefault();
    store.set({busy:true,message:'正在诊断…'});
    try{
      const response=await fetch('/api/diagnose',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:query.current.value})});
      const r=await response.json();
      if(!response.ok)throw Error(r.message);
      render(r);
    }catch(err){
      store.set({message:err.message||'本地服务不可用，请检查启动状态'});
    }finally{
      store.set({busy:false});
    }
  }

  async function switchCard(target,from){
    try{
      const response=await fetch('/api/card/'+encodeURIComponent(target.id)+'?query='+encodeURIComponent(query.current.value));
      if(!response.ok)throw Error();
      const next=await response.json();
      next.alternatives=[{id:from.card.id,point:from.card.point},...from.alternatives.filter(x=>x.id!==target.id)].slice(0,2);
      render(next);
    }catch{
      store.set({message:'切换失败，请重试'});
    }
  }

  return <>
    <header>
      <strong>AXIOM <span>诊断台</span></strong>
      <small>从疑问出发，看见化学结构</small>
      <b id="mode">{state.mode}</b>
    </header>
    <main>
      <section className="model">
        <iframe id="axiom" title="AXIOM 三维模型" src="axiom/AXIOM_Lab.html#app" onLoad={onFrameLoad}/>
      </section>
      <aside>
        <form id="form" onSubmit={submit}>
          <label htmlFor="query">你的问题，或你认为的答案</label>
          <textarea id="query" ref={query} className={state.compact?'compact':undefined} maxLength={4000} required placeholder="例如：NH₃ 有三个 N—H 键，为什么不是平面三角形？"/>
          <div id="examples">
            {EXAMPLES.map(([label,q])=><button key={label} type="button" onClick={()=>{query.current.value=q;}}>{label}</button>)}
          </div>
          <button id="submit" disabled={state.busy}>开始诊断 →</button>
        </form>
        <p id="message" role="status">{state.message}</p>
        <div id="result" aria-live="polite">
          {state.result
            ?<Result key={state.renderId} result={state.result} status={state.status} viewTrace={state.viewTrace} onSwitch={switchCard}/>
            :<p className="muted">输入一个问题，找到对应知识与三维结构。</p>}
        </div>
      </aside>
    </main>
  </>;
}
