import {ALIASES,lex} from './aliases.mjs';
const molecules=new Set(['H2O','NH3','CH4','CO2','SO2','C2H2','C2H4','C2H6','C6H6','CCl4','BF3','CO3_2m','NH4_1p']);
const crystals=new Set(['FCC','BCC','SC','NaCl','diamond','dryice','graphite']);
for(const id of Object.keys(ALIASES))if(!['FCC','BCC','SC','NaCl','diamond','dryice','graphite','CsCl','CaF2','ZnS','SiO2','hcp'].includes(id))molecules.add(id);for(const id of ['CsCl','CaF2','ZnS','SiO2','hcp'])crystals.add(id);
const category=id=>molecules.has(id)?'molecule':crystals.has(id)?'crystal':null;
export function makeView(query,axiom){const parsed=lex(query),id=parsed.species[0];if(axiom===null&&!parsed.complex&&parsed.species.length===1&&category(id))return {query_species:id,from:'query',axiom:{species:id,...(/大[πΠ]键|离域[πΠ]键|大派键/.test(query)?{layers:['delocalized']}:{})}};if(!parsed.complex&&parsed.species.length===1&&axiom?.species&&id!==axiom.species&&category(id)&&category(id)===category(axiom.species))return {query_species:id,from:'query',axiom:{species:id,...(axiom.layers?{layers:axiom.layers}:{})}};return {query_species:parsed.species.length===1?parsed.species[0].replace(/^unknown:/,''):null,from:'card',axiom};}
