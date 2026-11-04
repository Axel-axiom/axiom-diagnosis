import {readFile,writeFile} from 'node:fs/promises';import {SYSTEM} from '../deepseek.mjs';
const q=JSON.parse(await readFile('../报告/检索质量.json','utf8')),b=JSON.parse(await readFile('../报告/浏览器测试.json','utf8'));
const number=x=>x.toFixed(4);const negatives=q.negative.map(x=>`| ${x.query} | ${number(x.score)} | ${x.first} | ${x.rejected?'无匹配':'本地匹配'} |`).join('\n');
const report=`# AXIOM 诊断台 1.0 交付报告

交付日期：2026-11-03。项目位于本报告相邻 diagnosis 目录。原生 JavaScript + Node 内置 http/fs/fetch，无第三方依赖。AXIOM 作为独立 iframe 嵌入，以 postMessage 控制；原始知识库与模型文件均未修改。

## 原文件一致性

知识库：248 张卡片、240 条错因、743 条问法、143 个 axiom 调用。

知识库原件与 data/kb.json SHA-256 均为 224BFC3218F2893054B235A63B25698AF8B9EC8667294E8A13EEE439B64BD0B0。

AXIOM_Lab(2).html 与 public/axiom/AXIOM_Lab.html SHA-256 均为 BA71899D8434DA7E7086AAB424CC44BAC328F8D2D841180CE806F30E4C07F8AB。

附件按用户标注作为 0.13.1 使用；内嵌模块清单 appVersion 字段仍为 0.13.0，未修改附件版本字段。未来更新仅替换该 HTML。

## 检索及阈值

索引文本取 point、conclusion、questions 和关联错因的 name、symptom。NFKC 统一上下标数字，英文小写化，然后切汉字二元组及字母数字词元。TF 权重为 1+ln(tf)，IDF 为 1+ln((N+1)/(df+1))；查询未收录词元使用 df=0，保留在向量长度中。按余弦相似度排序，进阶卡乘 0.85，返回前 8。

743 条问法 Top-8：${q.hits}/${q.total}，100%。这是文档要求的库内回查，问法本身也进入索引，不能据此宣称陌生真实问法同样有 100% 准确率。

全部问法的第 1 名加权得分分布：

| 最低 | P5 | P25 | 中位数 | P75 | P95 | 最高 |
|---|---|---|---|---|---|---|
| ${[0,.05,.25,.5,.75,.95,1].map(p=>number(q.distribution[p])).join(' | ')} |

初始阈值 0.12：743 条库内问法均保留，范围外样例拦截 19/20；「怎么计算三角形面积？」得分 0.1298，误匹配 K04-10。

正式阈值校准为 **0.14**：范围外样例拦截 20/20，库内问法仍全部保留（最低 0.1979）。0.14 位于已测负样例最高分 0.1298 与库内最低分之间，留出少量余量。该阈值是这两组数据的工程初值，20 条负样例规模较小，并非开放问题范围判断的保证；后续应以独立学生问法验证。词面高度相似的教材外问题仍可能进入本地检索结果。

| 范围外问题（自编） | 第 1 名得分 | 第 1 名 | 0.14 下结果 |
|---|---|---|---|
${negatives}

完整逐条正负样例结果见 [检索质量.json](检索质量.json)，实际控制台输出见 [检索测试输出.txt](检索测试输出.txt)。

## 经用户确认的规则修改

原开发指令“没有 Key 一律使用第 1 名”改为：低分且 AI 不可用或返回 none，mode=none；高分且 AI 返回 none，mode=local，显示「AI 未找到确切匹配，以下为知识库检索结果」。高分且 AI 不可用显示「AI 暂不可用，以下为知识库检索结果」。AI 合法选择时 mode=ai。

本地错因仅在第 1 名卡片的关联错因中按 name、symptom 计算余弦匹配，独立阈值 0.12；无有效匹配返回 null。换卡清除先前错因和讲解。知识库字段直接返回，前端使用 textContent 展示，AI 只返回 id 与独立讲解。

## 实测记录

本机 Node 24.21.0，应用只使用 Node 22 已有功能；未在 Node 22 二进制下复测。

接口测试 9 项通过：正常返回、非法卡片、非法关联错因、讲解超长、空内容、超时、模型选 none、HTTP 错误、离线与静态文件安全等。校验失败用本地假服务验证两次调用后降级，超时也是本地模拟。返回 card/error 深度比较原始字段，测试 Key 不出现在接口与前端文件。服务端不打印请求、模型原始错误或 Key，仅打印启动地址。实际输出见 [接口测试输出.txt](接口测试输出.txt)。

Chrome、Edge 各 10 张不同 axiom 参数卡片，通过页面诊断和页面同一渲染函数触发联动；全部收到 axiom:result、ok:true，逐个检查请求字段对应 state。仅传 card 的调用检查 card；layers 检查所要求图层均存在。总计 ${b.length} 次通过；测试另外验证无 Key 模式为 local、1366×768 无横向溢出。真实浏览器 WebGL 上下文已建立（未禁用 WebGL）；具体 renderer 见 [浏览器测试.json](浏览器测试.json)。截图为实际浏览器渲染。浏览器用无头模式，未进行人工鼠标旋转体验验收。

本次抽测 10 张/浏览器，不声称已重新逐条测试全部 143 个 axiom；143 个调用全量通过来自用户提供的验证结果。

### 截图

![Chrome 模型 1](Chrome-1.png)
![Chrome 模型 2](Chrome-2.png)
![Chrome 模型 3](Chrome-3.png)
![Edge 模型 1](Edge-1.png)
![Edge 模型 2](Edge-2.png)
![Edge 模型 3](Edge-3.png)
![Chrome 无 Key 降级](Chrome-无Key.png)
![Edge 无 Key 降级](Edge-无Key.png)

### 真实 DeepSeek 冒烟

未执行：当前环境没有 DEEPSEEK_API_KEY。没有伪造真实模型返回。已提供 tests/smoke.mjs，包含开发指令全部 10 个问题；配置 Key 后手动运行会把 card_id、error_id、mode、讲解原文写入报告目录。默认模型按指令使用 deepseek-flash，实际账号模型可用性须由真实冒烟确认，可用 DEEPSEEK_MODEL 修改。

模型返回结构校验不能自动证明讲解没有知识性错误；已通过系统提示词限制来源、150 字长度与候选 id 范围，仍需人工审核真实讲解。

## 系统提示词全文

\`\`\`text
${SYSTEM}
\`\`\`
`;
await writeFile('../报告/交付报告.md',report);console.log('报告已生成');
