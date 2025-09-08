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
  const shares = process.argv[3];
  if (!sym || !shares) {
    throw new Error("Usage: node scripts/redeem_any_base.mjs <SYMBOL> <sharesWhole>");
  }

  const RPC = process.env.RPC_URL_BASE_SEPOLIA;
  const PK  = process.env.PRIVATE_KEY;
  if (!RPC || !PK) throw new Error("Missing RPC_URL_BASE_SEPOLIA or PRIVATE_KEY in .env");

  const store = JSON.parse(readFileSync("./addresses.local.json","utf8"));
  const VAULT_ADDR = toAddressOrDie((store.BASKETS || {})[sym] || "");

  const VAULT_ABI = JSON.parse(readFileSync("./scripts/abi/BasketVault.json","utf8")).abi;

  const provider = new JsonRpcProvider(RPC, { staticNetwork: "base-sepolia" });
  const wallet   = new Wallet(PK, provider);

  const VAULT = new Contract(VAULT_ADDR, VAULT_ABI, wallet);

  const sharesWei = toWei(shares);

  console.log("Wallet:", wallet.address);
  console.log("Redeem", shares, sym, "shares...");
  const tx = await VAULT.redeem(sharesWei);
  await tx.wait();

  console.log("Done.");
}

main().catch((e)=>{ console.error(e); process.exit(1); });
