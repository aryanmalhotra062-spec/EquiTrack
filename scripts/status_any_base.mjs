import "dotenv/config";
import { readFileSync } from "fs";
import { JsonRpcProvider, Wallet, Contract } from "ethers";

if (!process.env.RPC_URL_BASE_SEPOLIA) throw new Error("Missing RPC_URL_BASE_SEPOLIA in .env");
if (!process.env.PRIVATE_KEY) throw new Error("Missing PRIVATE_KEY in .env");

function toAddressOrDie(s) {
  if (typeof s !== "string" || !/^0x[0-9a-fA-F]{40}$/.test(s)) {
    throw new Error("Invalid 0x address in addresses.base.json");
  }
  return s;
}

function weiToStr(x) {
  const s = x.toString();
  if (s.length <= 18) return "0." + s.padStart(19, "0").slice(1);
  return s.slice(0, s.length - 18) + "." + s.slice(-18).replace(/0+$/, "");
}

async function main() {
  const sym = process.argv[2]; // e.g. eAI
  if (!sym) throw new Error("Usage: node scripts/status_any_base.mjs <SYMBOL>");

  // load addresses (ensure this matches where your deploy scripts saved)
  const store = JSON.parse(readFileSync("./addresses.base.json", "utf8"));
  const EQT_ADDR   = toAddressOrDie(store.EQT);
  const VAULT_ADDR = toAddressOrDie((store.BASKETS || {})[sym] || "");

  const EQT_ABI   = JSON.parse(readFileSync("./scripts/abi/EQT.json","utf8")).abi;
  const VAULT_ABI = JSON.parse(readFileSync("./scripts/abi/BasketVault.json","utf8")).abi;

  // ✅ ethers v6: pass chainId number, not { staticNetwork: ... }
  const provider = new JsonRpcProvider(process.env.RPC_URL_BASE_SEPOLIA, 84532);
  const wallet   = new Wallet(process.env.PRIVATE_KEY, provider);

  const EQT   = new Contract(EQT_ADDR,   EQT_ABI,   wallet);
  const VAULT = new Contract(VAULT_ADDR, VAULT_ABI, wallet);

  console.log("Wallet:", wallet.address);
  console.log("EQT:", EQT_ADDR);
  console.log(`Basket (${sym}):`, VAULT_ADDR);

  const eqtBal = await EQT.balanceOf(wallet.address);
  const total  = await VAULT.totalSupply();
  console.log("EQT Balance:", weiToStr(eqtBal), "EQT");
  console.log(`${sym} totalSupply:`, weiToStr(total), sym);

  // If you added balanceOf to BasketVault ABI, show your shares too:
  if (VAULT.interface.getFunction && VAULT.interface.getFunction("balanceOf")) {
    const myShares = await VAULT.balanceOf(wallet.address);
    console.log(`${sym} wallet shares:`, weiToStr(myShares), sym);
  }
}

main().catch((e)=>{ console.error(e); process.exit(1); });
