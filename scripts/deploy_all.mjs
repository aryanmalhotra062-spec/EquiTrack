// scripts/deploy_all.mjs
import { JsonRpcProvider, Wallet, ContractFactory } from "ethers";
import { createRequire } from "module";
import { writeFileSync } from "fs";
const require = createRequire(import.meta.url);

// Load compiled artifacts
const eqtArtifact = require("../artifacts/contracts/EquiTrackToken.sol/EquiTrackToken.json");
const basketArtifact = require("../artifacts/contracts/BasketVault.sol/BasketVault.json");

// Hardhat local default first account (0xf39f...92266)
const PK = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const provider = new JsonRpcProvider("http://127.0.0.1:8545");
const wallet = new Wallet(PK, provider);

console.log("Deployer:", wallet.address);

// Get the next free nonce once, then increment manually
let nonce = await provider.getTransactionCount(wallet.address, "latest");
console.log("Starting nonce:", nonce);

console.log("Deploying EQT...");
const eqtFactory = new ContractFactory(eqtArtifact.abi, eqtArtifact.bytecode, wallet);
const eqt = await eqtFactory.deploy({ nonce });
await eqt.waitForDeployment();
const EQT_ADDR = await eqt.getAddress();
console.log("EQT deployed:", EQT_ADDR);
nonce += 1;

console.log("Deploying BasketVault...");
const basketFactory = new ContractFactory(basketArtifact.abi, basketArtifact.bytecode, wallet);
const basket = await basketFactory.deploy(EQT_ADDR, { nonce });
await basket.waitForDeployment();
const BASKET_ADDR = await basket.getAddress();
console.log("BasketVault deployed:", BASKET_ADDR);

// Save addresses for other scripts
writeFileSync("./addresses.local.json", JSON.stringify({ EQT: EQT_ADDR, BASKET: BASKET_ADDR }, null, 2));
console.log("Saved addresses to addresses.local.json");
