import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {openViewer} from './live-view.mjs';

import {readFile,writeFile,mkdir} from 'node:fs/promises';import {diagnose} from '../server.mjs';
export async function run(questions,name){if(!process.env.DEEPSEEK_API_KEY)throw Error('请先配置 DEEPSEEK_API_KEY');const dir=new URL('../../报告/',import.meta.url);await mkdir(dir,{recursive:true});const rows=[];const viewer=await openViewer();try{for(const item of questions){const query=typeof item==='string'?item:item.q,start=Date.now(),r=await diagnose(query),actual_model=await viewer.show(r);rows.push({query,mode:r.mode,card_id:r.card?.id||null,point:r.card?.point||null,error_id:r.error?.id||null,error_name:r.error?.name||null,confidence:r.trace.model.confidence,explanation:r.explanation,view:r.view,actual_model,validation:r.trace.validation,failures:r.trace.model.failures,model_status:r.trace.model.status,latency_ms:Date.now()-start,expected:item.ok||null,hit:item.ok?item.ok.includes(r.card?.id)&&r.mode==='ai':null});await writeFile(new URL(name,dir),JSON.stringify({total:questions.length,completed:rows.length,aiHits:rows.filter(x=>x.hit).length,rows},null,2));}return rows;}finally{viewer.close();}}
export async function loadAcceptance(file){return JSON.parse(await readFile(file ? path.resolve(file) : new URL('../data/acceptance.json',import.meta.url),'utf8'));}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const q=await loadAcceptance(process.argv[2]);await run(q,'独立集真实AI.json');}
