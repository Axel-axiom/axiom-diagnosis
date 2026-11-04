import {run} from './eval-ai.mjs';
const questions=['NH₃ 有三个 N—H 键，为什么不是平面三角形？','CO₂ 有两个双键，中心 C 是不是 4 个价层电子对？','He 的电子排布是 1s²，为什么不在 s 区？','氯乙酸的酸性为什么比乙酸强？','面心立方晶胞里有几个原子？我数了 14 个。','NaCl 晶胞中 Na⁺ 的配位数是多少？','[Co(NH₃)₅Cl]Cl₂ 里 Co 的配位数是几？','石墨既有共价键又有范德华力，算什么晶体？','水沸腾时是不是断开了 O—H 键？','Cr 的电子排布为什么是 3d⁵4s¹？'];
questions.push('苯分子的大π键怎么写？');
await run(questions,'真实DeepSeek冒烟.json');
