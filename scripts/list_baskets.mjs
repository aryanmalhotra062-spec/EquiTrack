import { readFileSync } from "fs";
const s = JSON.parse(readFileSync("./addresses.local.json","utf8"));
console.log("FACTORY:", s.FACTORY);
console.log("EQT:", s.EQT);
console.log("BASKETS:");
for (const [sym, addr] of Object.entries(s.BASKETS || {})) {
  console.log(`  ${sym} @ ${addr}`);
}
