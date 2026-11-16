import test from 'node:test';import assert from 'node:assert/strict';import http from 'node:http';import {createQuota,createServer} from '../server.mjs';
test('每日与每 IP 每小时的 AI 调用上限',()=>{let t=Date.UTC(2026,10,16,1);const q=createQuota({daily:3,perIpHour:2,now:()=>t});
 assert.equal(q.take('a'),'');assert.equal(q.take('a'),'');assert.match(q.take('a'),/这一小时/);assert.equal(q.take('b'),'');assert.match(q.take('c'),/今天/);
 t+=3601e3;assert.match(q.take('a'),/今天/);t=Date.UTC(2026,10,17,1);assert.equal(q.take('a'),'');});
test('不设上限时不限制',()=>{const q=createQuota({daily:0,perIpHour:0});for(let i=0;i<50;i++)assert.equal(q.take('x'),'');});
test('超过上限时不调用模型，仍返回知识库结果',async t=>{let calls=0;const ai=http.createServer((q,r)=>{calls++;r.end('{}');});await new Promise(r=>ai.listen(0,'127.0.0.1',r));
 const s=createServer({key:'test-key',endpoint:'http://127.0.0.1:'+ai.address().port,quota:createQuota({daily:0,perIpHour:0,now:Date.now})&&{take:()=>'在线演示今天的 AI 诊断次数已用完，以下为知识库检索结果'}});await new Promise(r=>s.listen(0,'127.0.0.1',r));
 t.after(()=>{s.close();ai.close();});const res=await fetch('http://127.0.0.1:'+s.address().port+'/api/diagnose',{method:'POST',body:JSON.stringify({query:'NH₃ 为什么不是平面三角形？'})}).then(r=>r.json());
 assert.equal(calls,0);assert.equal(res.mode,'local');assert.match(res.message,/今天/);assert.equal(res.card.id,'K04-11');});
