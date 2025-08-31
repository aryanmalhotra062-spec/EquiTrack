import { JsonRpcProvider, Wallet, ContractFactory } from "ethers";
import { readFileSync, writeFileSync } from "fs";

const provider = new JsonRpcProvider("http://127.0.0.1:8545");

// Hardhat account #0 (same one you've been using)
const PK = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const wallet = new Wallet(PK, provider);

function loadJson(p) { return JSON.parse(readFileSync(p, "utf8")); }

const FACTORY_JSON = loadJson("./artifacts/contracts/BasketVaultFactory.sol/BasketVaultFactory.json");

console.log("Deployer:", wallet.address);

const factory = new ContractFactory(FACTORY_JSON.abi, FACTORY_JSON.bytecode, wallet);

// deploy
const contract = await factory.deploy();
await contract.deploymentTransaction().wait();
const addr = await contract.getAddress();

console.log("BasketVaultFactory deployed:", addr);

// Save to addresses.local.json
let store = {};
try { store = JSON.parse(readFileSync("./addresses.local.json", "utf8")); } catch {}
store.FACTORY = addr;
writeFileSync("./addresses.local.json", JSON.stringify(store, null, 2));
console.log("Saved FACTORY to addresses.local.json");
