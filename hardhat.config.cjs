require("@nomicfoundation/hardhat-toolbox");
require('solidity-coverage');
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-etherscan");
const secrets = require("./secrets.cjs");


module.exports = {
  networks: {
    bscTestnet :{
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: [secrets.account[0]],
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com/",
      accounts: [secrets.account[1]],
      //gasPrice: 8000000000,
      //gasLimit: 8000000000000
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
