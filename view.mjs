import {ALIASES,lex} from './aliases.mjs';
const molecules=new Set(['H2O','NH3','CH4','CO2','SO2','C2H2','C2H4','C2H6','C6H6','CCl4','BF3','CO3_2m','NH4_1p']);
const crystals=new Set(['FCC','BCC','SC','NaCl','diamond','dryice','graphite','V3Si','LaBeH8']);
for(const id of Object.keys(ALIASES))if(!['FCC','BCC','SC','NaCl','diamond','dryice','graphite','CsCl','CaF2','ZnS','SiO2','hcp','V3Si','LaBeH8'].includes(id))molecules.add(id);for(const id of ['CsCl','CaF2','ZnS','SiO2','hcp'])crystals.add(id);
const category=id=>molecules.has(id)?'molecule':crystals.has(id)?'crystal':null;
// 这些 AXIOM 卡片讲的是通用方法；卡片只链接到它们时，问题里点到的具体物质优先打开
const METHOD_CARDS=new Set(['big_pi','sigma_pi','hybrid_orbital','vsepr_model','molecular_polarity','unit_cell_calc','atomic_coordinates','atomic_spectra','acid_polarity']);
const yieldsToQuery=axiom=>axiom===null||(axiom&&!axiom.species&&METHOD_CARDS.has(axiom.card));
export function makeView(query,axiom){const parsed=lex(query),id=parsed.species[0];if(yieldsToQuery(axiom)&&!parsed.complex&&parsed.species.length===1&&category(id))return {query_species:id,from:'query',axiom:{species:id,...(/大[πΠ]键|离域[πΠ]键|大派键/.test(query)?{layers:['delocalized']}:{})}};if(!parsed.complex&&parsed.species.length===1&&axiom?.species&&id!==axiom.species&&category(id)&&category(id)===category(axiom.species))return {query_species:id,from:'query',axiom:{species:id,...(axiom.layers?{layers:axiom.layers}:{})}};return {query_species:parsed.species.length===1?parsed.species[0].replace(/^unknown:/,''):null,from:'card',axiom};}
