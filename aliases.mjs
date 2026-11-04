export const ALIASES={H2O:['水分子','水'],NH3:['氨分子','氨气','氨'],CH4:['甲烷'],CO2:['二氧化碳'],SO2:['二氧化硫'],C2H4:['乙烯'],C2H2:['乙炔'],C2H6:['乙烷'],C6H6:['苯分子','苯'],CCl4:['四氯化碳'],BF3:['三氟化硼'],CO3_2m:['碳酸根'],NH4_1p:['铵根'],FCC:['面心立方'],BCC:['体心立方'],SC:['简单立方'],NaCl:['氯化钠'],diamond:['金刚石'],dryice:['干冰'],graphite:['石墨']};
const blocked=['水解','水合','水溶液','结晶水','配位水','水化物','氨水','氨基','铵盐','甲苯','苯酚','苯甲酸','聚乙烯','氯甲烷'];
const names=Object.entries(ALIASES).flatMap(([id,names])=>names.map(name=>({name,id}))).concat(blocked.map(name=>({name,id:null}))).sort((a,b)=>b.name.length-a.name.length);
const canonical=new Map(Object.keys(ALIASES).map(id=>[id,id]));canonical.set('CO3','CO3_2m');canonical.set('NH4','NH4_1p');
const lower=new Map(['H2O','NH3','CH4','CO2','SO2','C2H2','C2H4','C2H6','C6H6','CCl4','BF3','NaCl'].map(id=>[id.toLowerCase(),id]));
export function lex(input){
 let s=String(input).replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹]*[⁺⁻])/g,m=>' '+m).normalize('NFKC').replace(/[−–—]/g,'-').replace(/离域π键|大派键/g,'大π键');
 s=s.replace(/V(?=形)/g,'v');const complex=/[\[\]【】]/.test(s)||/干冰.*CO2|CO2.*干冰|结晶水|配位水|水化物/.test(s);
 s=s.replace(/\[[^\]]*\](?:\d*[+-])?/g,' ');
 const found=[],terms=[];let rest='';
 for(let i=0;i<s.length;){const n=names.find(n=>s.startsWith(n.name,i));if(n){if(n.id){found.push(n.id);terms.push(n.id.toLowerCase());}else terms.push('compound:'+n.name);rest+=' ';i+=n.name.length;continue;}
 const f=s.slice(i).match(/^nacl\b|^(?:[A-Z][a-z]?\d*)+(?:\s*\d*[+-])?|^[a-z]+\d[a-z\d]*(?:\s*\d*[+-])?|^(?:FCC|BCC|SC)\b/);
 if(f){const charge=f[0].match(/\s+(\d*[+-])$/);if(charge)terms.push('charge:'+charge[1]);const raw=f[0].replace(/\s+\d*[+-]$|[+-]$/,''),id=canonical.get(raw)||lower.get(raw);terms.push(id?id.toLowerCase():'formula:'+raw);if(id||! /^[A-Z][a-z]?$/.test(raw))found.push(id||'unknown:'+raw);rest+=' ';i+=f[0].length;continue;}
 rest+=s[i++];}
 return {rest,terms,species:[...new Set(found)],complex};
}
export function tokens(input){let {rest,terms}=lex(input);rest=rest.replace(/大π键|σ键|π键/g,m=>' '+m+' ');const out=[...terms];for(const p of rest.match(/大π键|σ键|π键|[σπ]|[\p{Script=Han}]+|[a-z]+|\d+/gu)||[]){if(/^[\p{Script=Han}]+$/u.test(p)){for(let i=0;i<p.length-1;i++)out.push(p.slice(i,i+2));}else out.push(p.toLowerCase());}return out.filter(t=>!['为什','什么','怎么','么写','几个','是几','多少','如何','怎样','为啥','的是','为是'].includes(t));}







