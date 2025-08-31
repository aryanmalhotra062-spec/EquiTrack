import { JsonRpcProvider, Wallet, Contract } from "ethers";
import { readFileSync } from "fs";
const { EQT, BASKET } = JSON.parse(readFileSync("./addresses.local.json", "utf8"));
const PK = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const provider = new JsonRpcProvider("http://127.0.0.1:8545");
const wallet = new Wallet(PK, provider);
const ERC20 = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)"
];
const eqt = new Contract(EQT, ERC20, wallet);
const basket = new Contract(BASKET, ERC20, wallet);
const [eqtSym, eqtDec, bSym, bDec, eqtBal, bBal] = await Promise.all([
  eqt.symbol(), eqt.decimals(), basket.symbol(), basket.decimals(),
  eqt.balanceOf(wallet.address), basket.balanceOf(wallet.address)
]);
console.log("Wallet:", wallet.address);
console.log("EQT:", Number(eqtBal)/10**Number(eqtDec), eqtSym, "@", EQT);
console.log("BASKET:", Number(bBal)/10**Number(bDec), bSym, "@", BASKET);
