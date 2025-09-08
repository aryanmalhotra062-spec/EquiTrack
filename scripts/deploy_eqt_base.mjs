import "dotenv/config";
import { ethers } from "ethers";
import { readFileSync, writeFileSync } from "fs";

const RPC = process.env.RPC_URL_BASE_SEPOLIA;
const PK  = process.env.PRIVATE_KEY;

if (!RPC || !PK) throw new Error("Missing RPC_URL_BASE_SEPOLIA or PRIVATE_KEY");

const provider = new ethers.JsonRpcProvider(RPC);
const wallet   = new ethers.Wallet(PK, provider);

const EQT_ART  = JSON.parse(readFileSync("./artifacts/contracts/EquiTrackToken.sol/EquiTrackToken.json","utf8"));

const ADDR_FILE = "./addresses.base.json";
function loadStore(){
  try { return JSON.parse(readFileSync(ADDR_FILE,"utf8")); } catch { return {}; }
}
function saveStore(obj){ writeFileSync(ADDR_FILE, JSON.stringify(obj, null, 2)); }

async function main(){
  console.log("Deployer:", wallet.address);
  const factory = new ethers.ContractFactory(EQT_ART.abi, EQT_ART.bytecode, wallet);
  const eqt = await factory.deploy();
  const rc  = await eqt.waitForDeployment();
  const addr = await eqt.getAddress();
  console.log("EQT deployed:", addr);

  const store = loadStore();
  store.EQT = addr;
  saveStore(store);
}

main().catch(e=>{ console.error(e); process.exit(1); });
