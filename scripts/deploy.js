async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const EQT = await ethers.getContractFactory("EquiTrackToken");
  const eqt = await EQT.deploy();
  await eqt.deployed();

  console.log("EQT deployed to:", eqt.address);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
