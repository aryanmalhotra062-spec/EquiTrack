import { JsonRpcProvider, Wallet, Contract, isAddress } from "ethers";
import { readFileSync, writeFileSync } from "fs";

const provider = new JsonRpcProvider("http://127.0.0.1:8545");
const PK = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const wallet = new Wallet(PK, provider);

// Load addresses (EQT + FACTORY must be here)
const storePath = "./addresses.local.json";
let store = {};
try { store = JSON.parse(readFileSync(storePath, "utf8")); } catch {}
const FACTORY = store.FACTORY;
let EQT = store.EQT;

// Fallback to the default first-deployed address on a fresh Hardhat node
if (!isAddress(EQT)) {
  EQT = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  console.log("⚠️ No EQT in addresses.local.json. Using default:", EQT);
}
if (!isAddress(FACTORY)) throw new Error("Factory not found in addresses.local.json. Run deploy_factory.mjs first.");

console.log("Deployer:", wallet.address);
console.log("Factory:", FACTORY);
console.log("EQT:", EQT);

const FACTORY_ABI = [
  "event BasketCreated(address indexed basket, string name, string symbol, address asset, address owner)",
  "function createBasket(address asset,string name,string symbol,address owner) external returns (address)",
  "function basketsCount() view returns (uint256)",
  "function baskets(uint256) view returns (address)"
];

const factory = new Contract(FACTORY, FACTORY_ABI, wallet);

// Define the 6 baskets you want to add
const defs = [
  { name: "EquiTrack AI Basket",           symbol: "eAI"   },
  { name: "EquiTrack Aerospace Basket",     symbol: "eAERO" },
  { name: "EquiTrack Health Basket",        symbol: "eHEALTH" },
  { name: "EquiTrack Construction Basket",  symbol: "eBUILD" },
  { name: "EquiTrack Energy Basket",        symbol: "eNRG"  },
  { name: "EquiTrack Entertainment Basket", symbol: "eENT"  },
];

store.BASKETS = store.BASKETS || {};

let nonce = await provider.getTransactionCount(wallet.address, "latest");
console.log("Starting nonce:", nonce);

for (const d of defs) {
  // skip if we already created one with the same symbol
  if (store.BASKETS[d.symbol]) {
    console.log(`↪︎ Skipping ${d.symbol} (already saved @ ${store.BASKETS[d.symbol]})`);
    continue;
  }

  console.log(`Creating ${d.name} (${d.symbol}) ...`);
  const tx = await factory.createBasket(EQT, d.name, d.symbol, wallet.address, { nonce });
  const rc = await tx.wait();
  nonce += 1;

  // read the last basket created
  const count = await factory.basketsCount();
  const addr = await factory.baskets(Number(count) - 1);
  store.BASKETS[d.symbol] = addr;
  console.log(`  -> ${addr}`);
}

// Save back to file
writeFileSync(storePath, JSON.stringify(store, null, 2));
console.log("\nSaved to", storePath);
console.log(store.BASKETS);
