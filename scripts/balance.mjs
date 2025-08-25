// scripts/balance.mjs
// Read your EQT balance using ethers v6 + local JSON-RPC

import { JsonRpcProvider, Contract, isAddress } from "ethers";

// ---- EDIT THESE TWO LINES ONLY ----
const ACCOUNT = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"; // your deployer (From:)
const EQT_ADDR = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // your contract address
// -----------------------------------

if (!isAddress(ACCOUNT)) throw new Error("ACCOUNT is not a valid 0x address.");
if (!isAddress(EQT_ADDR)) throw new Error("EQT_ADDR is not a valid 0x address.");

const provider = new JsonRpcProvider("http://127.0.0.1:8545");

const ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

const eqt = new Contract(EQT_ADDR, ABI, provider);

const [bal, dec, sym] = await Promise.all([
  eqt.balanceOf(ACCOUNT),
  eqt.decimals(),
  eqt.symbol()
]);

// Convert BigInt safely for display
const balanceNum = Number(bal) / 10 ** Number(dec);

console.log("Address:", ACCOUNT);
console.log("Balance:", balanceNum, sym);
