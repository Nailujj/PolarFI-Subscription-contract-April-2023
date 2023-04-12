require("@nomicfoundation/hardhat-toolbox");
require('solidity-coverage');
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-etherscan");
const secrets = require("./secrets.cjs");


module.exports = {
  networks: {
    bscTestnet :{
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: [secrets.account[2]],
      gasPrice: 10000000000, // 10 Gwei

    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com/",
      accounts: [secrets.account[1]]
    },
    hardhat: {
    },
  },
  etherscan: {
    apiKey: secrets.apiKey,
  },
  solidity: {
    compilers: [
      {
        version: "0.8.9",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ]
  },
};
