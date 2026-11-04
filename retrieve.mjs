import {tokens,lex} from './aliases.mjs';
export {tokens} from './aliases.mjs';
export function createRetriever(kb) {
 const errors=new Map(kb.errors.map(e=>[e.id,e]));
 const docs=kb.cards.map(c=>tokens([c.point,c.conclusion,...c.questions,...c.errors.flatMap(id=>{const e=errors.get(id);return e?[e.name,e.symptom]:[];})].join(' ')));
 const df=new Map();for(const d of docs)for(const t of new Set(d))df.set(t,(df.get(t)||0)+1);
 function vector(ts){const v=new Map();for(const t of ts)v.set(t,(v.get(t)||0)+1);let n=0;for(const [t,f]of v){const w=(1+Math.log(f))*(1+Math.log((docs.length+1)/((df.get(t)||0)+1)));v.set(t,w);n+=w*w;}return {v,n:Math.sqrt(n)};}
 function cosine(a,b){let dot=0;for(const [t,w]of a.v)dot+=w*(b.v.get(t)||0);return a.n&&b.n?dot/a.n/b.n:0;}
 const vectors=docs.map(vector);const fields=kb.cards.map(c=>c.questions.map(t=>vector(tokens(t))));
 return {search(q){const a=vector(tokens(q));return kb.cards.map((card,i)=>({card,score:(.9*cosine(a,vectors[i])+.1*Math.max(...fields[i].map(b=>cosine(a,b)))+(lex(q).species.length===1&&lex(q).species[0]===card.axiom?.species? .03:0))*(tokens(q).includes('大π键')?(docs[i].includes('大π键')?2:.5):1)*(card.tier==='进阶'?.85:1)})).sort((a,b)=>b.score-a.score||a.card.id.localeCompare(b.card.id)).slice(0,8);},localError(q,card){const a=vector(tokens(q)),asked=lex(q).species;return card.errors.map(id=>errors.get(id)).filter(Boolean).filter(error=>{if(asked.length!==1)return true;const mentioned=lex(error.name+' '+error.symptom).species;return !mentioned.length||mentioned.includes(asked[0]);}).map(error=>({error,score:cosine(a,vector(tokens(error.name+' '+error.symptom)))})).sort((a,b)=>b.score-a.score).find(x=>x.score>=.12)?.error||null;}};
}







