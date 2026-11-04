import {openModel} from './axiom-bridge.js';

function Trace({result,viewTrace}){
  const {retrieval,model,validation}=result.trace;
  const first=retrieval.top[0];
  const view=result.view;
  return <details open>
    <summary>诊断过程</summary>
    <details>
      <summary>{'检索：候选 '+retrieval.top.length+' 张 · '+first.id+' / '+first.score.toFixed(3)}</summary>
      {retrieval.top.map(c=><p key={c.id}>{c.id+' '+c.point+' '+c.score.toFixed(3)+' '+c.tier}</p>)}
    </details>
    <p>{'AI 选择：'+model.name+' · '+model.attempts+' 次 · '+model.latency_ms+'ms · '+(model.confidence||model.status)}</p>
    <p>{'校验：'+(validation.passed?'通过':model.attempts===0?'未调用':JSON.stringify(validation))}</p>
    <p id="view-trace">{viewTrace??'三维：'+(view?.axiom?.species||view?.axiom?.card||'无')+' · '+(view?.from==='query'?'来自问题':'来自卡片')}</p>
  </details>;
}

function Section({title,id,children}){
  return <article id={id}><h3>{title}</h3>{children}</article>;
}

export default function Result({result:r,status,viewTrace,onSwitch}){
  return <>
    {r.trace&&<Trace result={r} viewTrace={viewTrace}/>}
    {r.card&&<>
      {r.trace?.model.confidence==='low'&&<p className="badge">AI 把握较低，可查看其他候选</p>}
      {r.error&&<Section title="错因">
        <h2>{r.error.name}</h2>
        {r.error.candidate&&<span className="badge">候选错因，待审定</span>}
        <p>{r.error.symptom}</p>
        {r.error.correct&&<p>{'正确理解：'+r.error.correct}</p>}
      </Section>}
      {r.explanation&&<Section title="AI 讲解 · AI 生成，供参考"><p>{r.explanation}</p></Section>}
      <Section title={'对应知识 · '+r.card.id}>
        {r.card.tier==='进阶'&&<span className="badge">进阶内容</span>}
        <h2>{r.card.point}</h2>
        <p>{r.card.conclusion}</p>
        <p>{r.card.steps}</p>
      </Section>
      <Section title="三维状态">
        {r.view?.axiom||r.axiom
          ?<><button onClick={openModel}>重新打开</button><p id="model-status">{status}</p></>
          :<p>这张卡片暂无对应的三维模型</p>}
      </Section>
      {r.alternatives.length>0&&<Section title="换一个" id="alternatives">
        {r.alternatives.map(c=><button key={c.id} onClick={()=>onSwitch(c,r)}>{c.point}</button>)}
      </Section>}
    </>}
  </>;
}
