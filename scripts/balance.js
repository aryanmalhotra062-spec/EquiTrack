// Read EQT balance using ethers v6 + local JSON-RPC provider (no Hardhat runtime)
const { ethers } = require("ethers");

async function main() {
  // 1) Connect to your local Hardhat node
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  // 2) Get the first local account directly from the node (no copy/paste needed)
  const [account] = await provider.send("eth_accounts", []);
  if (!account) throw new Error("No local accounts returned. Is `npx hardhat node` running?");

  // 3) Your deployed EQT contract address (keep this one)
  const EQT_ADDR = "0x5fbb2315678afacb367f032d93f642f64180aa3";

  const ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
  ];

  const eqt = new ethers.Contract(EQT_ADDR, ABI, provider);
  const [bal, dec, sym] = await Promise.all([
    eqt.balanceOf(account),
    eqt.decimals(),
    eqt.symbol()
  ]);

  console.log("Address:", account);
  console.log("Balance:", Number(bal) / 10 ** dec, sym);
}

main().catch((e) => { console.error(e); process.exit(1); });
