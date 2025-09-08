import "dotenv/config";
import { readFileSync } from "fs";
import { JsonRpcProvider, Wallet, Contract } from "ethers";
import "dotenv/config";

if (!process.env.RPC_URL_BASE_SEPOLIA) {
  throw new Error("Missing RPC_URL_BASE_SEPOLIA in .env");
}
if (!process.env.PRIVATE_KEY) {
  throw new Error("Missing PRIVATE_KEY in .env");
}

const DEC = 10n ** 18n;
const toWei = (n) => (BigInt(n) * DEC);

function toAddressOrDie(s) {
  if (typeof s !== "string" || !/^0x[0-9a-fA-F]{40}$/.test(s)) {
    throw new Error("Invalid 0x address in addresses.local.json");
  }
  return s;
}

async function main() {
  const sym = process.argv[2];
  const amt = process.argv[3];
  if (!sym || !amt) {
    throw new Error("Usage: node scripts/deposit_any_base.mjs <SYMBOL> <amountWhole>");
  }

  const RPC = process.env.RPC_URL_BASE_SEPOLIA;
  const PK  = process.env.PRIVATE_KEY;
  if (!RPC || !PK) throw new Error("Missing RPC_URL_BASE_SEPOLIA or PRIVATE_KEY in .env");

  const store = JSON.parse(readFileSync("./addresses.local.json","utf8"));
  const EQT_ADDR   = toAddressOrDie(store.EQT);
  const VAULT_ADDR = toAddressOrDie((store.BASKETS || {})[sym] || "");

  const EQT_ABI   = JSON.parse(readFileSync("./scripts/abi/EQT.json","utf8")).abi;
  const VAULT_ABI = JSON.parse(readFileSync("./scripts/abi/BasketVault.json","utf8")).abi;

  const provider = new JsonRpcProvider(RPC, { staticNetwork: "base-sepolia" });
  const wallet   = new Wallet(PK, provider);

  const EQT   = new Contract(EQT_ADDR,   EQT_ABI,   wallet);
  const VAULT = new Contract(VAULT_ADDR, VAULT_ABI, wallet);

  const amountWei = toWei(amt);

  console.log("Wallet:", wallet.address);
  console.log("Approve", amt, "EQT ->", sym);
  let tx = await EQT.approve(VAULT_ADDR, amountWei);
  await tx.wait();

  console.log("Deposit", amt, "EQT into", sym);
  tx = await VAULT.deposit(amountWei);
  await tx.wait();

  console.log("Done.");
}

main().catch((e)=>{ console.error(e); process.exit(1); });
