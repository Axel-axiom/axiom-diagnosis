# A/B 真实 DeepSeek 对比

默认配置按要求保持 A（disabled / 800），未根据运行结果选择配置。代码固定后，每组各运行11条冒烟和15条未公开验收，共52条问题；四份JSON分别保存在报告/A与报告/B，没有覆盖彼此。

| 组：thinking / max_tokens | ai条数（冒烟/独立） | local条数（冒烟/独立） | 独立集命中数 | 失败原因及次数（原因 / finish_reason） | 平均 / 最长耗时（秒） | 思考token | 总token |
|---|---|---|---|---|---|---|---|
| A：disabled / 800 | 26（11/15） | 0（0/0） | 14/15 | 无 | 1.262 / 1.592 | 未返回 | 49480（26/26次） |
| B：enabled / 4000 | 26（11/15） | 0（0/0） | 14/15 | 无 | 3.677 / 9.246 | 10511（26/26次） | 60593（26/26次） |

统计口径：

- ai/local为最终mode；括号中依次为冒烟/未公开集，独立命中按脚本期望卡片集合统计。不下准确率结论。
- 失败次数按每次请求计，包括重试后恢复成功的情况；不是失败题目数。finish_reason 未获得时记“未返回”，不猜测。
- 平均/最长耗时采用每条报告的 latency_ms，含诊断、重试和浏览器模型回执；每组26条。模型调用自身耗时另见下文。
- token为各次请求的已报告usage累加，包含重试。括号是有该字段的请求次数/总尝试次数。缺失值不当作0，不能据不完整usage认定实际耗用量；不保存reasoning_content、原始content或Key。
- 两组均沿用每次15秒超时、最多两次请求，未更改重试与超时规则。

模型调用平均/最长耗时：A组 1.145 / 1.478 秒；B组 3.552 / 9.119 秒。

最终none数量：A组 0；B组 0；模型打开失败：A组 0；B组 0。

本地验证：npm test 23/23，退出码0；npm run quality 的五项数字未变（Top-1 27/35，Top-8 35/35，独立集低分1/35，库内Top-8 743/743，范围外拦截19/20），仍按原门槛退出码1。Chrome与Edge真实WebGL测试均通过，新增三个本地错因断言均通过。

本地错因新增物种过滤，只影响localError；search排序公式、权重和阈值0.12未变。页面布局、系统提示词、kb和AXIOM均未修改。

kb SHA-256：596B3C470CA29450ABAE730980219EDC29E0D4DB50B071908700C7A0B41B07F7

AXIOM SHA-256：BA71899D8434DA7E7086AAB424CC44BAC328F8D2D841180CE806F30E4C07F8AB

参数及统计字段依据：[DeepSeek Thinking Mode](https://api-docs.deepseek.com/guides/thinking_mode/)、[Chat Completions API](https://api-docs.deepseek.com/api/create-chat-completion/)。JSON模式的空白返回与length截断均以实际finish_reason记录，不能仅凭空内容归因为思考token占满。
