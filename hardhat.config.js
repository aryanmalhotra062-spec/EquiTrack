require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { PRIVATE_KEY, RPC_URL_BASE_SEPOLIA } = process.env;

module.exports = {
  solidity: "0.8.20",
  networks: {
    baseSepolia: {
      url: RPC_URL_BASE_SEPOLIA,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 84532,
    },
  },
};
