import {ALIASES,lex} from './aliases.mjs';
const molecules=new Set(['H2O','NH3','CH4','CO2','SO2','C2H2','C2H4','C2H6','C6H6','CCl4','BF3','CO3_2m','NH4_1p']);
const crystals=new Set(['FCC','BCC','SC','NaCl','diamond','dryice','graphite','V3Si','LaBeH8']);
for(const id of Object.keys(ALIASES))if(!['FCC','BCC','SC','NaCl','diamond','dryice','graphite','CsCl','CaF2','ZnS','SiO2','hcp','V3Si','LaBeH8'].includes(id))molecules.add(id);for(const id of ['CsCl','CaF2','ZnS','SiO2','hcp'])crystals.add(id);
const category=id=>molecules.has(id)?'molecule':crystals.has(id)?'crystal':null;
// 这些 AXIOM 卡片讲的是通用方法；卡片只链接到它们时，问题里点到的同类物质优先打开（分子方法卡只让给分子，晶体方法卡只让给晶体），并带上该方法对应的图层
const METHOD_CARDS={big_pi:['molecule',['delocalized']],sigma_pi:['molecule',[]],hybrid_orbital:['molecule',['hybrid']],vsepr_model:['molecule',[]],molecular_polarity:['molecule',['polarity']],acid_polarity:['molecule',['polarity']],unit_cell_calc:['crystal',[]],atomic_coordinates:['crystal',[]]};
const methodFor=axiom=>axiom&&!axiom.species&&Object.hasOwn(METHOD_CARDS,axiom.card)?METHOD_CARDS[axiom.card]:null;
// 一句话里比较两种以上羧酸时，打开 AXIOM「羧酸的酸性」演示：pKa 条形图把它们排在一起，三维显示排在最后的那种
// 只在问酸性强弱时用（问杂化、沸点等不切到酸性演示）
const ACIDITY=/酸性|酸的强弱|强酸|弱酸|pKa|Ka|电离|给出\s*H|失去\s*H|共轭碱/i;
const ACID_STEPS=['ACID_C2H5COOH','ACID_CH3COOH','ACID_HCOOH','ACID_CH2ClCOOH','ACID_CHCl2COOH','ACID_CCl3COOH','ACID_CF3COOH'];
const BASE_NOTE='原酸示意，共轭碱是失去 H⁺ 后的羧酸根';
// card 可选：讲共轭碱的卡片打开原酸模型时也加提示（例如从别的问题点「换一个」切过来）
export function makeView(query,axiom,card=null){query=String(query).normalize('NFKC');const view=pickView(query,axiom);if(view.axiom?.species?.startsWith('ACID_')&&(/共轭碱|酸根|失去\s*(?:H|质子)|COO-/.test(query)||/共轭碱/.test(card?.point||'')))view.note=BASE_NOTE;return view;}
function pickView(query,axiom){const parsed=lex(query),id=parsed.species[0],method=methodFor(axiom);if(!parsed.complex&&parsed.species.length>1&&parsed.species.every(s=>ACID_STEPS.includes(s))&&ACIDITY.test(query))return {query_species:null,from:'query',axiom:{species:'demo_pka',highlight:'step:'+Math.max(...parsed.species.map(s=>ACID_STEPS.indexOf(s)+1))}};if(axiom===null&&!parsed.complex&&parsed.species.length===1&&category(id))return {query_species:id,from:'query',axiom:{species:id,...(/大[πΠ]键|离域[πΠ]键|大派键/.test(query)?{layers:['delocalized']}:{})}};
 if(method&&!parsed.complex&&parsed.species.length===1&&category(id)===method[0]){const layers=[...new Set([...method[1],...(/大[πΠ]键|离域[πΠ]键|大派键/.test(query)?['delocalized']:[])])];return {query_species:id,from:'query',axiom:{species:id,...(layers.length?{layers}:{})}};}if(!parsed.complex&&parsed.species.length===1&&axiom?.species&&id!==axiom.species&&category(id)&&category(id)===category(axiom.species))return {query_species:id,from:'query',axiom:{species:id,...(axiom.layers?{layers:axiom.layers}:{})}};return {query_species:parsed.species.length===1?parsed.species[0].replace(/^unknown:/,''):null,from:'card',axiom};}
