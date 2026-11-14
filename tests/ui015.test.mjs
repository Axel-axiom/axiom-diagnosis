import {spawn} from 'node:child_process';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from '../server.mjs';
const before=process.argv.includes('--before');
const out=path.resolve('../验收015');
await mkdir(out,{recursive:true});
const server=createServer({key:''});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const profile=path.join(out,'browser-profile-'+Date.now());
const proc=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-sandbox','--disable-gpu-sandbox','--remote-debugging-port=0','--user-data-dir='+profile,'--no-first-run','--no-default-browser-check','--window-size=1920,1080','about:blank'],{windowsHide:true,stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let ws;const results=[],errors=[],external=[];
try{
 let port;for(let i=0;i<100;i++){try{port=(await readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];break;}catch{}await sleep(100);}assert.ok(port);
 const target=(await(await fetch('http://127.0.0.1:'+port+'/json')).json()).find(x=>x.type==='page');
 ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 let id=0;const jobs=new Map();
 ws.onmessage=e=>{const v=JSON.parse(e.data);if(v.id){const job=jobs.get(v.id);jobs.delete(v.id);v.error?job.reject(Error(JSON.stringify(v.error))):job.resolve(v.result);}else if(v.method==='Runtime.exceptionThrown')errors.push(v.params.exceptionDetails.text);else if(v.method==='Network.requestWillBeSent'&&/^https?:/.test(v.params.request.url)&&!v.params.request.url.startsWith(base))external.push(v.params.request.url);};
 const call=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;jobs.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
 const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const until=async(expression,label)=>{for(let i=0;i<200;i++){if(await evaluate(expression))return;await sleep(100);}throw Error('Timed out: '+label);};
 const size=async(width,height)=>{await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await sleep(400);};
 const shot=async name=>{await sleep(400);const s=await call('Page.captureScreenshot',{format:'png'});await writeFile(path.join(out,name+'.png'),Buffer.from(s.data,'base64'));};
 const click=async selector=>{const box=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);await call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...box});await call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...box});};
 await call('Page.enable');await call('Runtime.enable');await call('Network.enable');await size(1920,1080);
 await call('Page.navigate',{url:base});await until('!!document.querySelector("#axiom")?.contentWindow?.AXIOM','Lab ready');await sleep(1500);
 if(before){await shot('01-改版前-1920x1080');console.log('Baseline screenshot captured from the untouched copy.');}
 else{
  await until('!document.querySelector("[data-module]")?.disabled','modules ready');
  assert.equal(await evaluate('!!document.querySelector("#welcome")'),true);
  assert.equal(await evaluate('document.querySelector(".frame-shell").inert'),true);
  assert.equal(await evaluate('document.querySelectorAll(".module-card").length'),5);
  assert.equal(await evaluate('[...document.querySelectorAll(".module-art")].every(x=>x.complete&&x.naturalWidth>0)'),true);
  await shot('02-改版后-欢迎页-1920x1080');results.push('1920×1080 welcome, five loaded vectors, inactive iframe inert');
  const q=await evaluate('document.querySelector(".question-row button").textContent.slice(0,-1)');await click('.question-row button');assert.equal(await evaluate('document.querySelector("#query").value'),q);
  await click('.suggestions-title button');assert.notEqual(await evaluate('document.querySelector(".question-row button").textContent.slice(0,-1)'),q);results.push('example fills input; next batch changes questions');
  for(const [module,panel]of [['vsepr','vsepr-module'],['crystal','crystal-module'],['atom','atom-module'],['demo','demo-module'],['cards','knowledge-panel']]){
   await click('[data-module="'+module+'"]');await until('!document.querySelector("#welcome")','workspace');
   await until('!document.querySelector("#axiom").contentDocument.querySelector("#'+panel+'").hidden','module '+module);
   assert.equal(await evaluate('document.querySelector(".frame-shell").inert'),false);
   if(module==='cards'||module==='atom'||module==='demo')await shot('模块-'+module+'-1920x1080');
   results.push('module '+module+' opens original '+panel);
   await click('.workspace-bar button');await until('!!document.querySelector("#welcome")','return welcome');
   assert.equal(await evaluate('document.querySelector("#query").value'),q);
  }
  await evaluate('document.querySelector("#query").value=""');await click('#submit');assert.equal(await evaluate('!!document.querySelector("#welcome")'),true);results.push('empty input stays on welcome');
  await click('#examples button');await click('#submit');
  await until('!!window.lastAxiomResult&&!!window.diagnosisResult&&!document.querySelector("#submit").disabled','diagnosis result');
  const diagnosis=await evaluate('({mode:diagnosisResult.mode,attempts:diagnosisResult.trace.model.attempts,state:lastAxiomResult.state,ok:lastAxiomResult.ok})');
  assert.equal(diagnosis.mode,'local');assert.equal(diagnosis.attempts,0);assert.equal(diagnosis.ok,true);assert.equal(diagnosis.state.species,'NH3');assert.ok(diagnosis.state.layers.includes('lone_pairs'));
  assert.equal(await evaluate('!!document.querySelector("#welcome")'),false);
  const canvas=await evaluate('(()=>{const d=document.querySelector("#axiom").contentDocument;return [...d.querySelectorAll("canvas")].some(c=>{const r=c.getBoundingClientRect();return r.width>0&&r.height>0&&r.top<d.defaultView.innerHeight;});})()');assert.equal(canvas,true);
  await shot('03-改版后-诊断三维-1920x1080');results.push({test:'no-key NH3 diagnosis, zero AI attempts, live visible 3D canvas',...diagnosis});
  await click('#alternatives button');await until('document.querySelector("#message").textContent.includes("已切换")','alternative');results.push('alternative card switches');
  await click('.workspace-bar button');assert.ok(await evaluate('document.querySelector("#query").value.includes("NH₃")'));
  for(const [width,height]of [[1366,768],[768,1024],[390,844]]){
   await size(width,height);assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,'overflow '+width);
   assert.equal(await evaluate('[...document.querySelectorAll(".module-card")].every(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.left>=0&&r.right<=innerWidth;})'),true);
   await evaluate('scrollTo(0,0)');await shot('响应式-'+width+'x'+height);results.push('responsive '+width+'×'+height+' without horizontal overflow');
  }
  await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});assert.equal(await evaluate('getComputedStyle(document.querySelector(".molecule-float")).animationName'),'none');results.push('reduced motion respected');
  await size(1920,1080);await click('[data-module="vsepr"]');await click('.workspace-bar button');
  await evaluate('document.querySelector("#query").value="篮球比赛每队有几个人？"');await click('#submit');await until('window.diagnosisResult?.mode==="none"&&!document.querySelector("#submit").disabled','no match');assert.match(await evaluate('document.querySelector("#message").textContent'),/没有找到/);results.push('out-of-scope no-match message');
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);results.push('zero uncaught page errors; zero external browser requests');
  console.log(JSON.stringify(results,null,2));
 }
}finally{ws?.close();proc.kill();server.closeAllConnections();server.close();await writeFile(path.join(out,before?'before.json':'ui015-results.json'),JSON.stringify({results,errors,external},null,2));}
