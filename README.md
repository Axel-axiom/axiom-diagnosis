# AXIOM 诊断台 1.1

需要 Node.js 22 或更高版本，无需 npm install。双击 HTML 不会启动诊断服务。

在本目录打开 PowerShell（资源管理器地址栏输入 powershell）：

```powershell
# 可选；不配置时仍可使用知识库检索
$env:DEEPSEEK_API_KEY = '你的密钥'
# 可选，默认 deepseek-flash
$env:DEEPSEEK_MODEL = 'deepseek-flash'
node server.mjs
```

浏览器访问 http://localhost:8787 ，结束时按 Ctrl+C。端口冲突可先设置 `$env:PORT = '8788'`。
CMD 用户可用 `set DEEPSEEK_API_KEY=你的密钥`，然后运行 `node server.mjs`。
密钥只设置在当前终端环境，不要写入任何项目文件、截图或报告。

运行自动测试（先停止已有服务，以免 8787 冲突）：

```powershell
node --test tests/api.test.mjs tests/v11.test.mjs
node tests/quality.mjs
node tests/browser.mjs
# 仅有 Key 且允许真实联网时手动运行
node tests/smoke.mjs
```

浏览器测试使用本机 Chrome、Edge 和浏览器原生 CDP，无第三方依赖。路径在测试脚本开头，可按实际安装位置修改。报告写入相邻的「报告」目录。应用代码采用 Node 22 支持的内置接口；浏览器测试脚本使用内置 WebSocket，需要 Node 22.4+。本次实测环境 Node 24.21.0。

`data/kb.json` 是原知识库的逐字节副本，应用只读。检索归一化只作用于内存索引。`public/axiom/AXIOM_Lab.html` 是附件原样副本；未来替换模型仅需替换该文件。

检索使用汉字二元组、字母数字词元、TF-IDF 余弦相似度。未收录词元计入查询向量长度，以减少无关查询分数虚高；进阶卡得分乘 0.85。正式无匹配阈值 0.12，错因匹配阈值独立为 0.12。详见交付报告。

低分且 AI 不可用或选 none：无匹配。高分且 AI 选 none：local 并显示「AI 未找到确切匹配，以下为知识库检索结果」。高分且 AI 不可用：local。AI 有效选择：ai。每次模型请求超时 15 秒；返回校验失败最多重试一次。

「换一个」仅切换知识卡片并重新打开模型，清除原错因和原 AI 讲解，避免把先前诊断套用到另一张卡片。

1.1 使用 aliases.mjs 做最长别名匹配和复合词屏蔽，view.mjs 负责保守物种替换，trace 显示实际诊断过程。索引/查询均保留化学式和希腊字母；检索混合整体文本与单条问法得分。

`npm test` 会执行接口与质量验收。本次独立集 Top-1 为 27/35，低于 28/35，因此质量脚本和 npm test **按设计返回非零退出码**；其余四项检索指标达标，不能据此称为全部验收通过。详见相邻报告。

真实模型验证由负责人 手动执行 `node tests/smoke.mjs` 或 `node tests/eval-ai.mjs`，会调用真实 DeepSeek，并启动本机 Chrome 无头窗口确认模型回执；按脚本位置定位输出目录、自动建目录、每条落盘。可从任意当前目录使用脚本绝对路径运行。smoke 包含原 10 条问题和新增苯问题。记录实际模型回执、耗时、confidence、卡片和错因原文。没有 Key 时立即退出，不伪造结果。

`.env.example` 仅作变量名模板；应用不会自动加载 .env，请在终端设置环境变量。交付包含本地 .git，未推送远程；提交作者为 Codex，本机实际提交时间由 Git 记录。
