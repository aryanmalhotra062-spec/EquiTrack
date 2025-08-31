// scripts/deploy_factory.mjs
import { JsonRpcProvider, Wallet, ContractFactory } from "ethers";
import { readFileSync, writeFileSync } from "fs";

// Local Hardhat node
const provider = new JsonRpcProvider("http://127.0.0.1:8545");

// Hardhat #0 default private key (same one you've been using)
const PK = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const wallet = new Wallet(PK, provider);

// Load compiled artifacts from Hardhat
const FACTORY_JSON = JSON.parse(
  readFileSync("./artifacts/contracts/BasketVaultFactory.sol/BasketVaultFactory.json", "utf8")
);

// Deploy
let nonce = await provider.getTransactionCount(wallet.address, "latest");
console.log("Deployer:", wallet.address, "starting nonce:", nonce);

const factory = new ContractFactory(FACTORY_JSON.abi, FACTORY_JSON.bytecode, wallet);
const tx = await factory.deploy({ nonce });
const receipt = await tx.deploymentTransaction().wait();
nonce += 1;

const addr = await tx.getAddress();
console.log("BasketVaultFactory deployed:", addr);

// Save to addresses.local.json
let store = {};
try { store = JSON.parse(readFileSync("./addresses.local.json", "utf8")); } catch {}
store.FACTORY = addr;
writeFileSync("./addresses.local.json", JSON.stringify(store, null, 2));
console.log("Saved FACTORY to addresses.local.json");
