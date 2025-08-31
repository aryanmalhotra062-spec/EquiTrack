import { JsonRpcProvider, Wallet, Contract, parseUnits } from "ethers";
import { readFileSync } from "fs";

const [ , , symbolOrAddr, amountStr ] = process.argv;
if (!symbolOrAddr) throw new Error("Usage: node scripts/redeem_any.mjs <SYMBOL|ADDRESS> <AMOUNT>");

const provider = new JsonRpcProvider("http://127.0.0.1:8545");
const PK = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const wallet = new Wallet(PK, provider);

const store = JSON.parse(readFileSync("./addresses.local.json", "utf8"));

// Resolve basket by symbol if needed
let basketAddr = symbolOrAddr;
if (store.BASKETS && store.BASKETS[symbolOrAddr]) basketAddr = store.BASKETS[symbolOrAddr];

const BASKET_ABI = [
  "function redeem(uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

const basket = new Contract(basketAddr, BASKET_ABI, wallet);

const [bDec, bSym, myShares] = await Promise.all([
  basket.decimals(), basket.symbol(), basket.balanceOf(wallet.address)
]);

const wanted = parseUnits(amountStr || "100", bDec);
const redeemAmount = myShares < wanted ? myShares : wanted;

console.log("Wallet:", wallet.address);
console.log(`Redeem ${Number(redeemAmount)/10**Number(bDec)} ${bSym} from ${basketAddr}`);

let nonce = await provider.getTransactionCount(wallet.address, "latest");
await (await basket.redeem(redeemAmount, { nonce })).wait();

const newShares = await basket.balanceOf(wallet.address);
console.log("Basket balance after:", Number(newShares)/10**Number(bDec), bSym);
