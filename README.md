# AXIOM 诊断台

面向高中化学“物质结构与性质”的 AI Web 应用。学生输入问题或答案，系统判断可能的错因，给出对应知识和讲解，并打开相关的三维模型。

知识以知识库为准，AI 只负责在检索候选中选择并写一段讲解。

**在线演示：** <http://47.243.238.47>（无需安装，手机和电脑都能打开）

## 快速运行（约 5 分钟）

需要 Node.js 22 或更高版本。构建产物已提交，运行不需要 `npm install`。

```powershell
# 可选：配置后使用 AI 诊断；不配置时使用知识库检索
$env:DEEPSEEK_API_KEY = '你的密钥'
node server.mjs
```

浏览器打开 <http://localhost:8787>，用完在终端按 `Ctrl+C`。

macOS 或 Linux 使用 `export DEEPSEEK_API_KEY=你的密钥`。密钥只放在当前终端环境，不要写入项目文件。

## 环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| `DEEPSEEK_API_KEY` | 无 | DeepSeek 密钥。未配置时自动使用知识库检索 |
| `DEEPSEEK_MODEL` | `deepseek-flash` | 模型名称 |
| `DEEPSEEK_THINKING` | `enabled` | 思考模式，`enabled` 或 `disabled` |
| `DEEPSEEK_MAX_TOKENS` | `4000` | 输出上限 |
| `PORT` | `8787` | 服务端口 |
| `HOST` | `127.0.0.1` | 监听地址。本机使用保持默认；部署到服务器时设为 `0.0.0.0` |
| `AI_DAILY_LIMIT` | 不限 | 每天最多调用模型的次数，超过后改用知识库检索 |
| `AI_IP_HOURLY` | 不限 | 每个访问者每小时最多调用模型的次数 |
| `TRUST_PROXY` | 不启用 | 部署在反向代理后面时设为 `1`，按代理转发的地址区分访问者 |

`.env.example` 只是变量名模板，应用不会自动读取 `.env`。

## 目录结构

| 路径 | 内容 |
|---|---|
| `server.mjs` | HTTP 服务、诊断接口和降级决策 |
| `retrieve.mjs`、`aliases.mjs` | 化学文本分词、别名和 TF-IDF 检索 |
| `deepseek.mjs` | 提示词、模型调用和结果校验 |
| `view.mjs` | 按问题中的物质确定实际打开的模型 |
| `src/` | React 诊断面板源码 |
| `public/app.js` | 前端构建产物 |
| `public/axiom/AXIOM_Lab.html` | 离线单文件三维模块（AXIOM Lab 0.14.0） |
| `data/kb.json` | 只读知识库：249 张卡片、241 条错因、748 条问法 |
| `tests/` | 接口、替换、检索、浏览器联动和真实模型测试 |
| `docs/开发记录/` | 开发过程中的修订记录，其中的数字和哈希属于当时的版本 |

## 在线演示部署

在线演示运行在一台 Ubuntu 22.04 云服务器上（中国香港，2 核 2G），由 systemd 守护进程启动 `node server.mjs`，设置 `HOST=0.0.0.0`、`PORT=80`。密钥写在服务器上只有管理员可读的 `/etc/axiom.env` 中，通过 systemd 的 `EnvironmentFile` 传给程序，不进入代码仓库。

在线演示限制每天最多调用模型 300 次、每个访问者每小时 20 次（`AI_DAILY_LIMIT`、`AI_IP_HOURLY`），超过后自动改用知识库检索，页面会提示原因。更新代码时在服务器上运行 `git -C /opt/axiom pull && systemctl restart axiom`。

仓库根目录的 `render.yaml` 也可用于在 Render 上部署（New → Blueprint，在提示时填写 `DEEPSEEK_API_KEY`）。

## 修改前端

```powershell
npm install
npm run build
```

## 测试

```powershell
# 接口与替换（不联网）
npm test

# 检索质量。独立集第 1 名 27/35 低于开发目标 28/35，脚本按设计返回非零退出码
npm run quality

# 浏览器联动（需要本机 Chrome、Edge，先停止占用 8787 的服务）
node tests/browser.mjs

# 真实模型（需要密钥）
node tests/smoke.mjs
node tests/eval-ai.mjs
```

检索质量和浏览器测试的结果写入项目旁边的“报告”文件夹。

## 诊断模式

| 情况 | 模式 | 页面 |
|---|---|---|
| AI 返回合法选择 | `ai` | 显示错因、AI 讲解和知识，打开模型 |
| 检索分数达标，AI 不可用 | `local` | 提示 AI 暂不可用，显示知识库检索结果 |
| 检索分数达标，AI 返回无匹配 | `local` | 提示 AI 未找到确切匹配，显示知识库检索结果 |
| 检索分数低于 0.12，AI 不可用或返回无匹配 | `none` | 提示知识库中没有找到对应内容 |

## 已知限制

- 校验只能保证结果结构合法，不能证明 AI 讲解的化学内容一定正确，页面因此标注“AI 生成，供参考”。
- 阈值拦截不能识别所有范围外问题，20 条测试中有 1 条未被拦截。
- 58 张知识卡片没有三维调用（多为晶体缺陷、陌生配合物反应等没有对应模型的进阶内容）。
- 没有学生试用数据，不能评价学习效果。

## AI 的使用

**作品中的 AI：** 诊断台运行时调用国产大模型 DeepSeek（`deepseek-flash`），在检索给出的候选中选择知识卡片和错因，并写一段讲解。知识内容以知识库为准，AI 的输出经过程序校验后才显示。

**开发过程中的辅助工具：** 编写代码、整理资料和复核时使用了 ChatGPT／Codex 和 Claude，当前 Git 提交由这两个工具完成。知识口径、错因审定、功能设计与取舍、测试验收由团队完成。
