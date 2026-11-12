// 桥接层：回退请求重新计时；切到没有模型的结果后，过期回执不再改写状态。用假的 iframe 和可控计时器，不需要浏览器。
import test from 'node:test';import assert from 'node:assert/strict';
test('回退请求重新计时，过期回执被忽略',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});
 const sent=[];const target=new EventTarget();
 const contentWindow={postMessage:m=>sent.push(m),AXIOM:{catalog:()=>({species:[{id:'NH3',layers:[]},{id:'H2O',layers:[]}],cards:[]})}};
 globalThis.window=target;globalThis.document={querySelector:()=>({contentWindow})};
 const {render,store}=await import('../src/axiom-bridge.js?bridge-test');
 const reply=data=>target.dispatchEvent(Object.assign(new Event('message'),{source:contentWindow,data:{type:'axiom:result',...data}}));
 render({card:{id:'K1'},axiom:{species:'H2O'},view:{from:'query',query_species:'NH3',axiom:{species:'NH3'}}});
 assert.equal(sent.length,1);assert.equal(sent[0].species,'NH3');
 reply({ok:false,error:'UNKNOWN_SPECIES'});
 assert.equal(sent.length,2,'按问题打开失败后发出回退请求');assert.equal(sent[1].species,'H2O');
 t.mock.timers.tick(12000);
 assert.equal(store.get().status,'模型未响应，请稍后点击重试','回退请求没有回执时也会超时提示');
 render({card:{id:'K2'},axiom:null,view:{from:'card',axiom:null}});
 assert.equal(sent.length,2,'没有模型的结果不发请求');
 reply({ok:true,state:{species:'H2O'}});
 assert.equal(store.get().status,'','过期回执不改写新结果的状态');
 t.mock.timers.tick(12000);assert.equal(store.get().status,'');
 delete globalThis.window;delete globalThis.document;
});
