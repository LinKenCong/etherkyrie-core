import '@nomicfoundation/hardhat-toolbox';
import 'solidity-coverage';
import 'hardhat-gas-reporter';
import * as dotenv from 'dotenv';
dotenv.config();

export default {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
    },
    localhost: {
      allowUnlimitedContractSize: true,
      url: `http://127.0.0.1:8545`,
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    polygon: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  gasReporter: {
    currency: 'USD',
    enabled: false,
    excludeContracts: [],
    src: './contracts',
  },
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 800,
      },
      metadata: {
        // do not include the metadata hash, since this is machine dependent
        // and we want all generated code to be deterministic
        bytecodeHash: 'none',
      },
    },
  },
};
