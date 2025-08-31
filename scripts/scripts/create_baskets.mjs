import { readFileSync, writeFileSync } from "fs";
import hre from "hardhat";
import { isAddress } from "ethers";

const EQT_ADDR = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // your deployed EQT on localhost
const storePath = "./addresses.local.json";

function loadStore() {
  try {
    return JSON.parse(readFileSync(storePath, "utf8"));
  } catch {
    return {};
  }
}

function saveStore(s) {
  writeFileSync(storePath, JSON.stringify(s, null, 2));
}

async function main() {
  if (!isAddress(EQT_ADDR)) throw new Error("Set a valid EQT address");

  const store = loadStore();
  const FACTORY = store.FACTORY;
  if (!isAddress(FACTORY)) throw new Error("Factory not found in addresses.local.json. Deploy it first.");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Factory:", FACTORY);
  console.log("Using EQT:", EQT_ADDR);

  const factory = await hre.ethers.getContractAt("BasketVaultFactory", FACTORY);

  // Define the baskets you want
  const defs = [
    { name: "EquiTrack AI Basket",          symbol: "eAI"  },
    { name: "EquiTrack Aerospace Basket",    symbol: "eAERO"},
    { name: "EquiTrack Health Basket",       symbol: "eHEALTH"},
    { name: "EquiTrack Construction Basket", symbol: "eBUILD"},
    { name: "EquiTrack Energy Basket",       symbol: "eNRG"},
    { name: "EquiTrack Entertainment Basket",symbol: "eENT"},
  ];

  store.BASKETS = store.BASKETS || {};

  for (const def of defs) {
    console.log(`\nCreating basket: ${def.name} (${def.symbol})...`);
    const tx = await factory.createBasket(EQT_ADDR, def.name, def.symbol, deployer.address);
    const rc = await tx.wait();
    const ev = rc.logs
      .map(l => {
        try { return factory.interface.parseLog(l); } catch { return null; }
      })
      .find(x => x && x.name === "BasketCreated");

    let basketAddr;
    if (ev) {
      basketAddr = ev.args.basket;
      console.log("Basket created from event:", basketAddr);
    } else {
      // Fallback: read the last created basket via the view function
      const count = await factory.basketsCount();
      basketAddr = await factory.baskets(count - 1n);
      console.log("Basket created (fallback):", basketAddr);
    }

    store.BASKETS[def.symbol] = basketAddr;
  }

  saveStore(store);
  console.log("\nSaved to", storePath);
  console.log(store.BASKETS);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
