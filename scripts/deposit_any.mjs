import { JsonRpcProvider, Wallet, Contract, parseUnits } from "ethers";
import { readFileSync } from "fs";

const [ , , symbolOrAddr, amountStr ] = process.argv;
if (!symbolOrAddr) throw new Error("Usage: node scripts/deposit_any.mjs <SYMBOL|ADDRESS> <AMOUNT>");

const provider = new JsonRpcProvider("http://127.0.0.1:8545");
const PK = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const wallet = new Wallet(PK, provider);

// Load addresses
const store = JSON.parse(readFileSync("./addresses.local.json", "utf8"));
const EQT = store.EQT || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Resolve basket by symbol if needed
let basketAddr = symbolOrAddr;
if (store.BASKETS && store.BASKETS[symbolOrAddr]) basketAddr = store.BASKETS[symbolOrAddr];

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
const basket = new Contract(basketAddr, BASKET_ABI, wallet);

const [eqtDec, eqtSym, bSym, bDec] = await Promise.all([
  eqt.decimals(), eqt.symbol(), basket.symbol(), basket.decimals()
]);
const amount = parseUnits(amountStr || "100", eqtDec);

console.log("Wallet:", wallet.address);
console.log(`Deposit ${amountStr || "100"} ${eqtSym} into ${bSym} @ ${basketAddr}`);

let nonce = await provider.getTransactionCount(wallet.address, "latest");

console.log("Approve...");
await (await eqt.approve(basketAddr, amount, { nonce })).wait();
nonce += 1;

console.log("Deposit...");
await (await basket.deposit(amount, { nonce })).wait();

const [eqtBal, bBal] = await Promise.all([
  eqt.balanceOf(wallet.address),
  basket.balanceOf(wallet.address)
]);

console.log("New EQT balance:", Number(eqtBal)/10**Number(eqtDec), eqtSym);
console.log("New Basket balance:", Number(bBal)/10**Number(bDec), bSym);
