const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const EQT = await ethers.getContractFactory("EquiTrackToken");
  const eqt = await EQT.deploy();
  await eqt.waitForDeployment();

  const addr = await eqt.getAddress();
  console.log("EQT deployed to:", addr);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
