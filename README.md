# EquiTrack MVP 🚀

EquiTrack is building a decentralized exchange (DEX) for **synthetic exposure to privately held companies**.  
This repo contains the **first working MVP** of the $EQT token and deployment scripts.

---

## 📌 What’s inside
- **`contracts/EquiTrackToken.sol`**
  - ERC-20 token ($EQT) built with OpenZeppelin
  - Initial supply: **1,000,000 EQT** minted to deployer
  - `mint()` function (owner-only) to issue more EQT if required
- **`scripts/deploy.js`**
  - Hardhat deploy script to deploy EQT locally/testnet
- **`scripts/balance.mjs`**
  - Script to query token balances from the blockchain
- **`hardhat.config.js`**
  - Hardhat configuration for local dev

---

## ✅ Current progress
- EQT token contract live on local Hardhat network
- Deployer wallet holds **1,000,000 EQT**
- Balance script confirms token supply + transfers working

---

## 🛠️ Next steps
1. Implement synthetic basket contract (e.g. `$FinTech` ETF-style token).
2. Build frontend (React + MetaMask) to interact with EQT + baskets.
3. Deploy to a public Ethereum testnet (Sepolia/Goerli/Arbitrum testnet).
4. Expand repo with docs + examples for contributors.

---

## 🔗 About
This is the **MVP foundation** for EquiTrack.  
Built using:
- [Hardhat](https://hardhat.org/)  
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)  
- Solidity ^0.8.20  

---

👤 Author: Aryan Malhotra (`aryanmalhotra062-spec`)
