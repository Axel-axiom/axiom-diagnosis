import {useState} from 'react';

export const MODULES=[
  {id:'vsepr',title:'分子空间结构',tags:['价层电子对','孤电子对','空间结构','分子极性'],color:'#45b9ff'},
  {id:'crystal',title:'晶胞结构',tags:['均摊法','配位数','离子晶体结构','投影与分数坐标'],color:'#ba93ff'},
  {id:'atom',title:'原子结构',tags:['电子排布','原子轨道','周期律'],color:'#7bbaff'},
  {id:'demo',title:'实验与演示',tags:['原子光谱','红外光谱','质谱','X 射线衍射','课本实验'],color:'#63e3cb'},
  {id:'cards',title:'知识卡片',tags:['构造原理','电负性','键参数','氢键','超分子'],color:'#f6cf74'},
];
const QUESTIONS=[
 ['为什么 NH₃ 是三角锥形，而 BF₃ 是平面三角形？','NaCl 和 CsCl 为什么是不同的晶体结构？','如何判断分子是否具有极性？'],
 ['水分子为什么是 V 形而不是直线形？','面心立方晶胞里有几个原子？我数了14个。','苯分子的大π键怎么写？'],
 ['CO₂ 有两个双键，中心 C 是不是 4 个价层电子对？','三氟乙酸为什么比乙酸酸性强？','硝酸根为什么是平面三角形？'],
];
export function Mark(){return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3 29 26H3Z" fill="none" stroke="currentColor" strokeWidth="2"/><path d="m9 21 7-12 7 12M12 17h8" fill="none" stroke="currentColor" strokeWidth="1.4"/></svg>;}
export function Icon({kind}){return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{kind==='search'?<><circle cx="13" cy="13" r="9"/><path d="m20 20 8 8"/></>:kind==='cube'?<><path d="m16 2 13 7v15l-13 7-13-7V9Z M3 9l13 7 13-7 M16 16v15"/></>:kind==='bot'?<><rect x="5" y="11" width="22" height="17" rx="6"/><path d="M16 11V6 M2 17v5 M30 17v5 M12 23h8"/><circle cx="16" cy="4" r="2"/><circle cx="11" cy="17" r="1"/><circle cx="21" cy="17" r="1"/></>:<><path d="m16 2 4 10 10 4-10 4-4 10-4-10-10-4 10-4Z"/></>}</svg>;}
function Atmosphere(){return <div className="atmosphere" aria-hidden="true">
  <svg className="wave-field" viewBox="0 0 1200 340" preserveAspectRatio="none"><defs><linearGradient id="wave-ink"><stop stopColor="#2376ff" stopOpacity="0"/><stop offset=".45" stopColor="#3f7dff"/><stop offset="1" stopColor="#b951ef"/></linearGradient><filter id="wave-glow"><feGaussianBlur stdDeviation="5"/></filter></defs><path d="M0 280 C260 320 380 335 550 245 S700 310 840 230 S1010 170 1200 80" stroke="url(#wave-ink)" strokeWidth="8" fill="none" filter="url(#wave-glow)"/>{Array.from({length:30},(_,i)=><path key={i} d={`M0 ${280+i*3} C260 ${320+i} 380 ${335-i*2} 550 ${245+i*2} S700 ${310+i*2} 840 ${230+i*3} S1010 ${170+i*3} 1200 ${80+i*5}`} stroke="url(#wave-ink)" strokeWidth={i===0?2:1} strokeOpacity={i===0?.85:.48-i*.01} strokeDasharray={i%3?'1 7':undefined} fill="none"/>)}</svg>
  <svg className="hero-molecule" viewBox="0 0 420 300"><defs>
    <radialGradient id="orb-blue" cx="30%" cy="24%" r="78%"><stop stopColor="#fff"/><stop offset=".13" stopColor="#a7ecff"/><stop offset=".35" stopColor="#308bff"/><stop offset=".7" stopColor="#2433b8"/><stop offset=".92" stopColor="#6651eb"/><stop offset="1" stopColor="#bdc6ff"/></radialGradient>
    <radialGradient id="orb-violet" cx="33%" cy="22%" r="79%"><stop stopColor="#fff"/><stop offset=".15" stopColor="#d1c8ff"/><stop offset=".4" stopColor="#7556d7"/><stop offset=".67" stopColor="#3d2482"/><stop offset=".89" stopColor="#ae69ff"/><stop offset="1" stopColor="#eed9ff"/></radialGradient>
    <linearGradient id="bond-light" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#92bbff"/><stop offset=".4" stopColor="#e9edff"/><stop offset=".6" stopColor="#8289f4"/><stop offset="1" stopColor="#b275ed"/></linearGradient>
    <filter id="orb-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>
  </defs><g className="molecule-float"><g fill="#6f58ff" opacity=".5" filter="url(#orb-glow)"><circle cx="220" cy="161" r="46"/><circle cx="266" cy="50" r="32"/><circle cx="309" cy="229" r="38"/><circle cx="91" cy="176" r="33"/></g><g strokeLinecap="round" fill="none"><path d="M92 176 220 161 266 50 M220 161 309 229" stroke="#837ee5" strokeWidth="17"/><path d="M92 173 220 158 266 47 M220 158 309 226" stroke="url(#bond-light)" strokeWidth="11"/><path d="M97 169 218 155 264 51 M226 158 307 222" stroke="#d5e9ff" strokeOpacity=".7" strokeWidth="3"/></g><circle cx="91" cy="176" r="33" fill="url(#orb-blue)"/><circle cx="266" cy="50" r="31" fill="url(#orb-violet)"/><circle cx="220" cy="161" r="45" fill="url(#orb-blue)"/><circle cx="309" cy="229" r="39" fill="url(#orb-violet)"/></g></svg>
</div>;}
export default function Welcome({onModule,onExample,ready}){
  const [batch,setBatch]=useState(0);
  return <div className="welcome" id="welcome">
    <div className="welcome-hero"><Atmosphere/><div className="hero-copy"><div className="lab-brand"><Mark/><strong>AXIOM <span>LAB</span></strong><span>· 诊断联动模式</span><span className="hero-pill">AI + 知识库 + 三维交互</span></div>
      <h1>从疑问出发，<span>看见化学结构</span></h1>
      <p>输入一个问题，系统将自动匹配知识卡片、三维模型与 AI 讲解，<br className="desktop-break"/>帮助你理解概念本质、识别易错点、构建结构化认知。</p>
    </div></div>
    <nav className="module-cards" aria-label="探索化学模块">{MODULES.map(m=><button key={m.id} type="button" className="module-card" data-module={m.id} style={{'--accent':m.color}} onClick={()=>onModule(m.id)} disabled={!ready} aria-label={'进入'+m.title}>
      <img className="module-art" src={'assets/module-'+m.id+'.svg'} alt=""/><strong>{m.title}</strong><span className="module-tags">{m.tags.map(t=><span key={t}>{t}</span>)}</span><span className="module-go">{m.id==='cards'?'浏览卡片':'探索与诊断'} <span>→</span></span>
    </button>)}</nav>
    <section className="suggestions" aria-label="示例问题"><div className="suggestions-title"><Icon/><strong>试试这些问题</strong><button type="button" onClick={()=>setBatch((batch+1)%QUESTIONS.length)}><span aria-hidden="true">↻</span> 换一批</button></div><div className="question-row">{QUESTIONS[batch].map(q=><button key={q} type="button" onClick={()=>onExample(q)}>{q}<span aria-hidden="true">›</span></button>)}</div></section>
  </div>;
}
export function Guide(){return <div className="diagnosis-guide" id="diagnosis-guide"><ol>{[['search','问题理解与知识匹配','识别关键词，定位相关知识与常见错因'],['cube','三维结构可视化','调用对应模型，直观呈现结构特征'],['bot','AI 讲解与诊断','结合知识库生成讲解；不可用时自动切换为知识库检索']].map(([icon,title,copy],i)=><li key={icon}><span className="step-number">{i+1}</span><span className="step-icon"><Icon kind={icon}/></span><div><strong>{title}</strong><p>{copy}</p></div></li>)}</ol><div className="returns"><strong><span aria-hidden="true">♧</span> 诊断将返回</strong><div>{['核心结论','易错点分析','知识卡片','三维模型'].map(t=><span key={t}><b>✓</b> {t}</span>)}</div><small>按匹配内容展示，部分知识点暂无三维模型。</small></div></div>;}
