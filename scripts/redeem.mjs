import { JsonRpcProvider, Wallet, Contract, parseUnits } from "ethers";
import { readFileSync } from "fs";

const { EQT, BASKET } = JSON.parse(readFileSync("./addresses.local.json", "utf8"));
const PK = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const provider = new JsonRpcProvider("http://127.0.0.1:8545");
const wallet = new Wallet(PK, provider);

const EQT_ABI = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)"
];
const BASKET_ABI = [
  "function redeem(uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

const eqt = new Contract(EQT, EQT_ABI, wallet);
const basket = new Contract(BASKET, BASKET_ABI, wallet);

const [bDec, bSym, eqtDec, eqtSym, shares] = await Promise.all([
  basket.decimals(), basket.symbol(), eqt.decimals(), eqt.symbol(), basket.balanceOf(wallet.address)
]);

// Redeem 500 shares (or all if you have less)
const target = parseUnits("500", bDec);
const redeemAmount = shares < target ? shares : target;

// manage nonce explicitly
let nonce = await provider.getTransactionCount(wallet.address, "latest");
console.log("Starting nonce:", nonce);

console.log(`Redeem ${Number(redeemAmount) / 10 ** Number(bDec)} ${bSym}...`);
await (await basket.redeem(redeemAmount, { nonce })).wait();

const [eqtBal, bBal] = await Promise.all([
  eqt.balanceOf(wallet.address),
  basket.balanceOf(wallet.address),
]);

console.log("EQT Balance:", Number(eqtBal) / 10 ** Number(eqtDec), eqtSym);
console.log("Basket Balance:", Number(bBal) / 10 ** Number(bDec), bSym);
