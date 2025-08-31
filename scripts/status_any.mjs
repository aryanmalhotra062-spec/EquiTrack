import { JsonRpcProvider, Wallet, Contract } from "ethers";
import { readFileSync } from "fs";

const [ , , symbolOrAddr ] = process.argv;

const provider = new JsonRpcProvider("http://127.0.0.1:8545");
const PK = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const wallet = new Wallet(PK, provider);

const store = JSON.parse(readFileSync("./addresses.local.json", "utf8"));
const EQT = store.EQT || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

let basketAddr = symbolOrAddr;
if (!basketAddr && store.BASKETS) {
  // default to first basket if no arg given
  const first = Object.values(store.BASKETS)[0];
  basketAddr = first;
}
if (store.BASKETS && store.BASKETS[symbolOrAddr]) basketAddr = store.BASKETS[symbolOrAddr];

const ERC20 = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)"
];

const eqt = new Contract(EQT, ERC20, wallet);
const basket = new Contract(basketAddr, ERC20, wallet);

const [eqtSym, eqtDec, bSym, bDec, eqtBal, bBal] = await Promise.all([
  eqt.symbol(), eqt.decimals(), basket.symbol(), basket.decimals(),
  eqt.balanceOf(wallet.address), basket.balanceOf(wallet.address)
]);

console.log("Wallet:", wallet.address);
console.log("EQT:", Number(eqtBal)/10**Number(eqtDec), eqtSym, "@", EQT);
console.log("BASKET:", Number(bBal)/10**Number(bDec), bSym, "@", basketAddr);
