/* eslint-disable @typescript-eslint/no-require-imports */
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv/config");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    mantleTestnet: {
      url: process.env.MANTLE_TESTNET_RPC || "https://rpc.testnet.mantle.xyz",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 5003,
    },
    mantleMainnet: {
      url: process.env.MANTLE_MAINNET_RPC || "https://rpc.mantle.xyz",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 5000,
    },
  },

  etherscan: {
    apiKey: {
      mantleTestnet: process.env.MANTLE_EXPLORER_API_KEY || "no-api-key",
      mantleMainnet: process.env.MANTLE_EXPLORER_API_KEY || "no-api-key",
    },
    customChains: [
      {
        network: "mantleTestnet",
        chainId: 5003,
        urls: {
          apiURL: "https://explorer.testnet.mantle.xyz/api",
          browserURL: "https://explorer.testnet.mantle.xyz",
        },
      },
      {
        network: "mantleMainnet",
        chainId: 5000,
        urls: {
          apiURL: "https://explorer.mantle.xyz/api",
          browserURL: "https://explorer.mantle.xyz",
        },
      },
    ],
  },
};
