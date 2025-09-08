@'
import { readFileSync, writeFileSync } from "fs";
import dotenv from "dotenv";
import { JsonRpcProvider, Wallet, Contract } from "ethers";
import factoryAbi from "../artifacts/contracts/BasketVaultFactory.sol/BasketVaultFactory.json" assert { type: "json" };

dotenv.config();

const provider = new JsonRpcProvider(process.env.RPC_URL_BASE_SEPOLIA, 84532);
const wallet = new Wallet(process.env.PRIVATE_KEY, provider);

const store = JSON.parse(readFileSync("./addresses.local.json", "utf8"));
const FACTORY = store.FACTORY;
const EQT = store.EQT;

const factory = new Contract(FACTORY, factoryAbi.abi, wallet);

async function create(name, symbol) {
  console.log(`Creating ${name} (${symbol}) ...`);
  const tx = await factory.createBasket(EQT, name, symbol, wallet.address);
  const rcpt = await tx.wait();

  // Find BasketCreated event (ethers v6 log parsing)
  const evt = rcpt.logs.find(l => l.fragment?.name === "BasketCreated");
  const basket = evt?.args?.basket ?? evt?.args?.[0];
  console.log("  ->", basket);
  return basket;
}

(async () => {
  store.BASKETS = store.BASKETS || {};
  store.BASKETS.eAI     = await create("EquiTrack AI Basket", "eAI");
  store.BASKETS.eAERO   = await create("EquiTrack Aerospace Basket", "eAERO");
  store.BASKETS.eHEALTH = await create("EquiTrack Health Basket", "eHEALTH");
  store.BASKETS.eBUILD  = await create("EquiTrack Construction Basket", "eBUILD");
  store.BASKETS.eNRG    = await create("EquiTrack Energy Basket", "eNRG");
  store.BASKETS.eENT    = await create("EquiTrack Entertainment Basket", "eENT");

  writeFileSync("./addresses.local.json", JSON.stringify(store, null, 2));
  console.log("Saved to ./addresses.local.json");
})();
'@ | Set-Content -Encoding utf8 scripts\create_baskets.mjs
