// scripts/deploy_basket.js
const { ethers } = require("hardhat");

// Your already-deployed EQT contract
const EQT_ADDR = "0x5fbb2315678afacb367f032d93f642f64180aa3";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer (wallet):", deployer.address); // 0xf39f...92266
  console.log("Using EQT:", EQT_ADDR);

  const Basket = await ethers.getContractFactory("BasketVault");
  const basket = await Basket.deploy(EQT_ADDR);
  await basket.waitForDeployment();

  const addr = await basket.getAddress();
  console.log("BasketVault deployed to:", addr);
}

main().catch((e) => { console.error(e); process.exit(1); });
