import "dotenv/config";
import { ethers } from "ethers";
import { readFileSync, writeFileSync } from "fs";

const RPC = process.env.RPC_URL_BASE_SEPOLIA;
const PK  = process.env.PRIVATE_KEY;

if (!RPC || !PK) throw new Error("Missing RPC_URL_BASE_SEPOLIA or PRIVATE_KEY");

const provider = new ethers.JsonRpcProvider(RPC);
const wallet   = new ethers.Wallet(PK, provider);

const FACT_ART = JSON.parse(readFileSync("./artifacts/contracts/BasketVaultFactory.sol/BasketVaultFactory.json","utf8"));

const ADDR_FILE = "./addresses.base.json";
function loadStore(){
  try { return JSON.parse(readFileSync(ADDR_FILE,"utf8")); } catch { return {}; }
}
function saveStore(obj){ writeFileSync(ADDR_FILE, JSON.stringify(obj, null, 2)); }

const BASKETS_TO_CREATE = [
  { name: "EquiTrack AI Basket",         symbol: "eAI"    },
  { name: "EquiTrack Aerospace Basket",   symbol: "eAERO"  },
  { name: "EquiTrack Health Basket",      symbol: "eHEALTH"},
  { name: "EquiTrack Construction Basket",symbol: "eBUILD" },
  { name: "EquiTrack Energy Basket",      symbol: "eNRG"   },
  { name: "EquiTrack Entertainment Basket",symbol:"eENT"   },
];

async function main(){
  const store = loadStore();
  if (!store.EQT) throw new Error("EQT not found in addresses.base.json (run deploy_eqt_base.mjs first)");
  if (!store.FACTORY) throw new Error("FACTORY not found in addresses.base.json (run deploy_factory_base.mjs first)");

  console.log("Deployer:", wallet.address);
  const factory = new ethers.Contract(store.FACTORY, FACT_ART.abi, wallet);

  if (!store.BASKETS) store.BASKETS = {};

  let nonce = await provider.getTransactionCount(wallet.address);

  for (const b of BASKETS_TO_CREATE) {
    console.log(`Creating ${b.name} (${b.symbol}) ...`);
    const tx = await factory.createBasket(store.EQT, b.name, b.symbol, wallet.address, { nonce });
    nonce++;
    const rc = await tx.wait();
    const ev = rc.logs.map(l=> {
      try { return factory.interface.parseLog(l); } catch { return null; }
    }).find(Boolean);
    let newAddr;
    if (ev && ev.name === "BasketCreated") {
      newAddr = ev.args.basket;
    } else {
      // fallback: read last basket by index
      const count = await factory.basketsCount();
      newAddr = await factory.baskets(count - 1n);
    }
    console.log("  ->", newAddr);
    store.BASKETS[b.symbol] = newAddr;
  }

  saveStore(store);
  console.log("\nSaved to", ADDR_FILE);
  console.log(store.BASKETS);
}

main().catch(e=>{ console.error(e); process.exit(1); });
