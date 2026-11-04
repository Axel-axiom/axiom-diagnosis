import {lex} from './aliases.mjs';
const molecules=new Set(['H2O','NH3','CH4','CO2','SO2','C2H2','C2H4','C2H6','C6H6','CCl4','BF3','CO3_2m','NH4_1p']);
const crystals=new Set(['FCC','BCC','SC','NaCl','diamond','dryice','graphite']);
const category=id=>molecules.has(id)?'molecule':crystals.has(id)?'crystal':null;
export function makeView(query,axiom){const parsed=lex(query),id=parsed.species[0];if(!parsed.complex&&parsed.species.length===1&&axiom?.species&&id!==axiom.species&&category(id)&&category(id)===category(axiom.species))return {from:'query',axiom:{species:id,...(axiom.layers?{layers:axiom.layers}:{})}};return {from:'card',axiom};}
