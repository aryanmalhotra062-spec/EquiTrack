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

async function main(){
  console.log("Deployer:", wallet.address);
  const factory = new ethers.ContractFactory(FACT_ART.abi, FACT_ART.bytecode, wallet);
  const inst = await factory.deploy();
  await inst.waitForDeployment();
  const addr = await inst.getAddress();
  console.log("BasketVaultFactory deployed:", addr);

  const store = loadStore();
  store.FACTORY = addr;
  saveStore(store);
}

main().catch(e=>{ console.error(e); process.exit(1); });
