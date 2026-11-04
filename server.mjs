import {makeView} from './view.mjs';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createRetriever} from './retrieve.mjs';
import {choose} from './deepseek.mjs';
export const root=fileURLToPath(new URL('.',import.meta.url));
export const kb=JSON.parse(await readFile(path.join(root,'data/kb.json'),'utf8'));
const retrieve=createRetriever(kb);
export async function diagnose(query,options={}){
 const candidates=retrieve.search(query), top=candidates[0],low=top.score<.12;
 const choice=await choose(query,candidates,kb,options),ai=choice.value;const trace={retrieval:{top:candidates.map(x=>({id:x.card.id,point:x.card.point,score:x.score,tier:x.card.tier}))},model:choice.trace,validation:choice.validation,view:{from:'card',species:''}};
 const matched=ai&&ai.card_id!=='none';
 if(!matched&&low)return {trace,view:null,mode:'none',card:null,error:null,explanation:null,alternatives:[],axiom:null,message:'知识库中没有找到对应内容'};
 const card=matched?candidates.find(x=>x.card.id===ai.card_id).card:top.card;
 const error=matched?kb.errors.find(e=>e.id===ai.error_id)||null:retrieve.localError(query,card);
 const view=makeView(query,card.axiom);trace.view={from:view.from,species:view.axiom?.species||''};return {trace,view,mode:matched?'ai':'local',card,error,explanation:matched?ai.explanation:null,alternatives:candidates.filter(x=>x.card.id!==card.id).slice(0,2).map(x=>({id:x.card.id,point:x.card.point})),axiom:card.axiom,message:matched?'':ai?.card_id==='none'?'AI 未找到确切匹配，以下为知识库检索结果':'AI 暂不可用，以下为知识库检索结果'};
}
export function createServer(options={}){return http.createServer(async(req,res)=>{
 const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 try{const url=new URL(req.url,'http://localhost');
 if(req.method==='POST'&&url.pathname==='/api/diagnose'){let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>20000)return send(413,{message:'输入过长'});}let input;try{input=JSON.parse(body);}catch{return send(400,{message:'无效 JSON'});}if(typeof input.query!=='string'||!input.query.trim()||input.query.length>4000)return send(400,{message:'请输入 1–4000 字的问题'});return send(200,await diagnose(input.query,options));}
 if(req.method==='GET'&&url.pathname.startsWith('/api/card/')){const card=kb.cards.find(c=>c.id===decodeURIComponent(url.pathname.slice(10)));return card?send(200,{view:makeView(url.searchParams.get('query')||'',card.axiom),mode:'local',card,error:null,explanation:null,alternatives:[],axiom:card.axiom,message:'已切换知识卡片'}):send(404,{});}
 if(req.method!=='GET')return send(405,{});
 const relative=decodeURIComponent(url.pathname==='/'?'index.html':url.pathname.slice(1)),base=path.join(root,'public'),file=path.resolve(base,relative);
 if(!file.startsWith(base+path.sep))return send(403,{});
 const buffer=await readFile(file);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'})[path.extname(file)]||'application/octet-stream'});res.end(buffer);
 }catch{send(404,{message:'请求失败'});}
 });}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))createServer().listen(Number(process.env.PORT||8787),'127.0.0.1',()=>console.log('AXIOM 诊断台：http://localhost:'+ (process.env.PORT||8787)));

