// scripts/deposit.mjs
import { JsonRpcProvider, Wallet, Contract, parseUnits } from "ethers";
import { readFileSync } from "fs";

const { EQT, BASKET } = JSON.parse(readFileSync("./addresses.local.json", "utf8"));

const PK = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const provider = new JsonRpcProvider("http://127.0.0.1:8545");
const wallet = new Wallet(PK, provider);

const EQT_ABI = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)"
];
const BASKET_ABI = [
  "function deposit(uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

const eqt = new Contract(EQT, EQT_ABI, wallet);
const basket = new Contract(BASKET, BASKET_ABI, wallet);

const [eqtSym, eqtDec] = await Promise.all([eqt.symbol(), eqt.decimals()]);
const amount = parseUnits("1000", eqtDec);

console.log("Wallet:", wallet.address);

// get current nonce once and bump manually for each tx
let nonce = await provider.getTransactionCount(wallet.address, "latest");
console.log("Starting nonce:", nonce);

console.log("Approve EQT -> Basket...");
await (await eqt.approve(BASKET, amount, { nonce })).wait();
nonce += 1;

console.log("Deposit 1000 EQT...");
await (await basket.deposit(amount, { nonce })).wait();

const [eqtBal, bBal, bDec, bSym] = await Promise.all([
  eqt.balanceOf(wallet.address),
  basket.balanceOf(wallet.address),
  basket.decimals(),
  basket.symbol(),
]);

console.log("EQT Balance:", Number(eqtBal) / 10 ** Number(eqtDec), eqtSym);
console.log("Basket Balance:", Number(bBal) / 10 ** Number(bDec), bSym);
