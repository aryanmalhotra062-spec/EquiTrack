// scripts/deploy_basket.mjs
import { JsonRpcProvider, Wallet, ContractFactory, getAddress, isAddress } from "ethers";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Load the compiled artifact without import assertions
const artifact = require("../artifacts/contracts/BasketVault.sol/BasketVault.json");

// Your already-deployed EQT address
const EQT_RAW = "0x5fbb2315678afacb367f032d93f642f64180aa3";

// Basic checks + normalization
if (!isAddress(EQT_RAW)) throw new Error("EQT address is invalid");
const EQT_ADDR = getAddress(EQT_RAW);

// Hardhat local default first account (deployer)
const PK = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const provider = new JsonRpcProvider("http://127.0.0.1:8545");
const wallet = new Wallet(PK, provider);

console.log("Deployer:", wallet.address);
console.log("Using EQT:", EQT_ADDR);

const { abi, bytecode } = artifact;

const factory = new ContractFactory(abi, bytecode, wallet);
const basket = await factory.deploy(EQT_ADDR);
await basket.waitForDeployment();

console.log("BasketVault deployed to:", await basket.getAddress());
